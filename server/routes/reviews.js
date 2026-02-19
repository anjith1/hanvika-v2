const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

// IMPORTANT NOTE ABOUT ROUTES:
// Route order matters in Express. More specific routes (like /published) must be defined
// before parameter routes (like /:id) to avoid conflicts.

// Load environment variables
dotenv.config();

// MySQL connection pools — created lazily on first use so server starts
// even when MYSQL_* env vars are not set in this environment.
let _createDbConnection = null;
let _pool = null;

const getCreateDbConnection = () => {
  if (!_createDbConnection) {
    _createDbConnection = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 60000,
      debug: process.env.NODE_ENV === 'development'
    });
  }
  return _createDbConnection;
};

const getPool = () => {
  if (!_pool) {
    _pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'local_connect_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 60000,
      debug: process.env.NODE_ENV === 'development'
    });
  }
  return _pool;
};


// Ensure upload directories exist
const uploadDir = path.join(__dirname, "../uploads");
const reviewImagesDir = path.join(uploadDir, "reviews");

// Create directories if they don't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(reviewImagesDir)) {
  fs.mkdirSync(reviewImagesDir);
}

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, reviewImagesDir);
  },
  filename: function (req, file, cb) {
    const uniqueId = uuidv4();
    cb(null, `${uniqueId}-${file.originalname}`);
  },
});

// File filter to validate image uploads
const fileFilter = (req, file, cb) => {
  // Accept image files only
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Handle multiple file upload fields
const uploadFields = upload.fields([
  { name: 'reviewImages', maxCount: 5 },
  { name: 'additionalImages', maxCount: 5 }
]);

// Ensure the MySQL database and tables exist
const initializeDatabase = async () => {
  // Skip MySQL setup if not configured in this environment
  if (!process.env.MYSQL_HOST) {
    console.log('⚠️  MYSQL_HOST not set — Reviews (MySQL) feature is disabled.');
    return;
  }
  try {
    console.log(`Connecting to MySQL at ${process.env.MYSQL_HOST} with user ${process.env.MYSQL_USER}...`);
    // First create database if it doesn't exist
    const connection = await getCreateDbConnection().getConnection();
    console.log('Successfully connected to MySQL server');

    const dbName = process.env.MYSQL_DATABASE || 'local_connect_db';

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    connection.release();

    console.log(`Database ${dbName} ensured`);

    // Now create tables in the database
    const dbConnection = await getPool().getConnection();
    console.log(`Successfully connected to database ${dbName}`);

    // Create the reviews table if it doesn't exist
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        is_anonymous TINYINT(1) DEFAULT 0,
        order_number VARCHAR(50) NOT NULL,
        product_name VARCHAR(255),
        overall_satisfaction INT NOT NULL,
        quality_of_work INT NOT NULL,
        timeliness INT NOT NULL,
        accuracy INT NOT NULL,
        written_review TEXT NOT NULL,
        worker_name VARCHAR(255) NOT NULL,
        communication_skills INT NOT NULL,
        professionalism INT NOT NULL,
        would_recommend TINYINT(1) DEFAULT 1,
        follow_up_needed TINYINT(1) DEFAULT 0,
        has_issue TINYINT(1) DEFAULT 0,
        issue_type VARCHAR(50),
        issue_description TEXT,
        consent_to_publish TINYINT(1) DEFAULT 1,
        status VARCHAR(20) DEFAULT 'pending',
        created_at DATETIME NOT NULL
      )
    `);

    // Create the review_images table if it doesn't exist
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS review_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        review_id INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        image_type ENUM('review', 'issue') DEFAULT 'review',
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
      )
    `);

    dbConnection.release();
    console.log("MySQL database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing MySQL database tables:", error);
    console.error("MySQL connection details:", {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      database: process.env.MYSQL_DATABASE
    });

    if (error.code === 'ECONNREFUSED') {
      console.error("Connection refused. Please make sure MySQL server is running and accessible.");
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("Access denied. Please check your MySQL username and password.");
    } else if (error.code === 'ETIMEDOUT') {
      console.error("Connection timed out. Please check your network settings and firewall rules.");
    }
  }
};

// Initialize database tables when the server starts
initializeDatabase();


// POST /api/reviews - Submit a new review
router.post("/", async (req, res) => {
  uploadFields(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error("Multer error:", err);
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`,
      });
    } else if (err) {
      // An unknown error occurred
      console.error("Unknown error:", err);
      return res.status(500).json({
        success: false,
        message: `Unknown error: ${err.message}`,
      });
    }

    try {
      console.log("Request body received:", req.body);
      console.log("Files received:", req.files);

      // Extract form fields
      const {
        name,
        email,
        is_anonymous, // Using snake_case to match form data
        order_number,
        product_name,
        overall_satisfaction,
        quality_of_work,
        timeliness,
        accuracy,
        written_review,
        worker_name,
        communication_skills,
        professionalism,
        would_recommend,
        follow_up_needed,
        has_issue,
        issue_type,
        issue_description,
        consent_to_publish,
        status,
      } = req.body;

      // Process file uploads
      const reviewImages = [];
      const additionalImages = [];

      // Extract file paths from the request
      if (req.files) {
        console.log('Files received:', JSON.stringify(req.files));

        // Process review images
        if (req.files.reviewImages) {
          req.files.reviewImages.forEach((file) => {
            // Store relative URL path instead of absolute file path
            const relativePath = `/uploads/reviews/${file.filename}`;
            reviewImages.push({
              filename: file.filename,
              path: relativePath,
              mimetype: file.mimetype,
            });
          });
        }

        // Process additional images
        if (req.files.additionalImages) {
          req.files.additionalImages.forEach((file) => {
            // Store relative URL path instead of absolute file path
            const relativePath = `/uploads/reviews/${file.filename}`;
            additionalImages.push({
              filename: file.filename,
              path: relativePath,
              mimetype: file.mimetype,
            });
          });
        }
      }

      // Current date for created_at field
      const currentDate = new Date();
      // Format as MySQL datetime: 'YYYY-MM-DD HH:MM:SS'
      const mysqlDatetime = currentDate.toISOString().slice(0, 19).replace('T', ' ');

      // Convert values to appropriate types for MySQL
      const isAnonymousValue = is_anonymous === "1" || is_anonymous === 1 || is_anonymous === "true" || is_anonymous === true ? 1 : 0;
      const wouldRecommendValue = would_recommend === "1" || would_recommend === 1 || would_recommend === "true" || would_recommend === true ? 1 : 0;
      const followUpNeededValue = follow_up_needed === "1" || follow_up_needed === 1 || follow_up_needed === "true" || follow_up_needed === true ? 1 : 0;
      const hasIssueValue = has_issue === "1" || has_issue === 1 || has_issue === "true" || has_issue === true ? 1 : 0;
      const consentToPublishValue = consent_to_publish === "1" || consent_to_publish === 1 || consent_to_publish === "true" || consent_to_publish === true ? 1 : 0;

      // Parse numeric values
      const overallSatisfactionValue = parseInt(overall_satisfaction) || 0;
      const qualityOfWorkValue = parseInt(quality_of_work) || 0;
      const timelinessValue = parseInt(timeliness) || 0;
      const accuracyValue = parseInt(accuracy) || 0;
      const communicationSkillsValue = parseInt(communication_skills) || 0;
      const professionalismValue = parseInt(professionalism) || 0;

      // Save the review data to MySQL database
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        console.log('Inserting review into database with fields:');
        console.log({
          name,
          email,
          is_anonymous: isAnonymousValue,
          order_number,
          product_name,
          overall_satisfaction: overallSatisfactionValue,
          quality_of_work: qualityOfWorkValue,
          timeliness: timelinessValue,
          accuracy: accuracyValue,
          written_review,
          worker_name,
          communication_skills: communicationSkillsValue,
          professionalism: professionalismValue,
          would_recommend: wouldRecommendValue,
          follow_up_needed: followUpNeededValue,
          has_issue: hasIssueValue,
          issue_type,
          issue_description,
          consent_to_publish: consentToPublishValue,
          status,
          created_at: mysqlDatetime
        });

        // Insert review
        const [result] = await connection.execute(
          `INSERT INTO reviews (
            name, email, is_anonymous, order_number, product_name,
            overall_satisfaction, quality_of_work, timeliness, accuracy,
            written_review, worker_name, communication_skills, professionalism,
            would_recommend, follow_up_needed, has_issue, issue_type, 
            issue_description, consent_to_publish, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            name || "Anonymous",
            email || "",
            isAnonymousValue,
            order_number || "N/A",
            product_name || "N/A",
            overallSatisfactionValue,
            qualityOfWorkValue,
            timelinessValue,
            accuracyValue,
            written_review || "",
            worker_name || "",
            communicationSkillsValue,
            professionalismValue,
            wouldRecommendValue,
            followUpNeededValue,
            hasIssueValue,
            issue_type || "",
            issue_description || "",
            consentToPublishValue,
            status || "pending",
            mysqlDatetime
          ]
        );

        console.log('Review inserted successfully, ID:', result.insertId);
        const reviewId = result.insertId;

        // Save image paths to database if images were uploaded
        if (reviewImages.length > 0) {
          console.log('Saving review images:', reviewImages.length);
          for (const image of reviewImages) {
            await connection.execute(
              `INSERT INTO review_images (review_id, filename, file_path, mime_type, image_type)
              VALUES (?, ?, ?, ?, 'review')`,
              [
                reviewId,
                image.filename,
                image.path,
                image.mimetype
              ]
            );
          }
        }

        if (additionalImages.length > 0) {
          console.log('Saving additional images:', additionalImages.length);
          for (const image of additionalImages) {
            await connection.execute(
              `INSERT INTO review_images (review_id, filename, file_path, mime_type, image_type)
              VALUES (?, ?, ?, ?, 'issue')`,
              [
                reviewId,
                image.filename,
                image.path,
                image.mimetype
              ]
            );
          }
        }

        await connection.commit();
        console.log('Transaction committed');

        // Return success response
        return res.status(201).json({
          success: true,
          message: "Review submitted successfully",
          reviewId: reviewId
        });
      } catch (error) {
        await connection.rollback();
        console.error('Database error, rolling back transaction:', error);
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error saving review:", error);
      return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
      });
    }
  });
});

// GET /api/reviews - Get all reviews
router.get("/", async (req, res) => {
  try {
    console.log("[GET /] Attempting to connect to database...");

    const connection = await pool.getConnection();
    console.log("[GET /] Successfully connected to database");

    try {
      console.log("[GET /] Executing query to fetch all reviews");
      const [reviews] = await connection.query(`
        SELECT * FROM reviews ORDER BY created_at DESC
      `);

      console.log(`[GET /] Query completed, found ${reviews.length} reviews`);

      // Fetch images for all reviews
      let reviewsWithImages = [...reviews];

      if (reviews.length > 0) {
        try {
          // Extract all review IDs
          const reviewIds = reviews.map(review => review.id);
          console.log(`[GET /] Fetching images for reviews with IDs: ${reviewIds.join(', ')}`);

          // Check if review_images table exists
          const [tableCheck] = await connection.query(`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_schema = ? AND table_name = 'review_images'
          `, [process.env.MYSQL_DATABASE || 'local_connect_db']);

          if (tableCheck[0].count === 0) {
            console.log("[GET /] review_images table does not exist");
          } else {
            // Safe way to build the query: If no reviews, we don't do an image query
            if (reviewIds.length > 0) {
              // Use a different approach for the IN clause to handle multiple IDs correctly
              let query = 'SELECT * FROM review_images WHERE review_id IN (';
              const placeholders = reviewIds.map(() => '?').join(',');
              query += placeholders + ')';

              try {
                const [allImages] = await connection.query(query, reviewIds);
                console.log(`[GET /] Found ${allImages.length} images for reviews`);

                // Map images to their respective reviews
                reviewsWithImages = reviews.map(review => {
                  const reviewImages = allImages.filter(img => img.review_id === review.id)
                    .map(img => {
                      // Convert file paths to relative URLs for web access
                      let path = img.path || img.file_path;

                      // If path is already a relative URL starting with /uploads, keep it
                      if (path && !path.startsWith('/uploads')) {
                        // Extract just the filename from the path
                        const filename = path.split(/[\\/]/).pop();
                        // Create a proper relative URL
                        path = `/uploads/reviews/${filename}`;
                      }

                      return {
                        ...img,
                        path: path
                      };
                    });

                  return {
                    ...review,
                    reviewImages: reviewImages || []
                  };
                });
              } catch (imageQueryError) {
                console.error("[GET /] Error fetching images:", imageQueryError);
                console.log("[GET /] Continuing with reviews but without images");
              }
            }
          }
        } catch (imageError) {
          console.error("[GET /] Error in image processing:", imageError);
          // Continue with reviews but without images in case of error
        }
      }

      return res.status(200).json({
        success: true,
        message: "Reviews fetched successfully",
        reviews: reviewsWithImages
      });
    } catch (queryError) {
      console.error("[GET /] Error executing query:", queryError);
      throw queryError;
    } finally {
      console.log("[GET /] Releasing database connection");
      connection.release();
    }
  } catch (error) {
    console.error("[GET /] Error in route handler:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
});

// IMPORTANT: Specific routes MUST come before parameter routes
// GET /api/reviews/published - Get reviews for public display
router.get("/published", async (req, res) => {
  try {
    console.log("==============================================");
    console.log("💡 [GET /published] Route handler triggered at " + new Date().toISOString());
    console.log("==============================================");

    const connection = await pool.getConnection();
    try {
      console.log("[GET /published] Fetching published reviews...");

      // First get all published reviews
      const [reviews] = await connection.query(`
        SELECT * FROM reviews 
        WHERE consent_to_publish = 1 AND is_anonymous = 0
        ORDER BY created_at DESC
      `);

      console.log(`[GET /published] Found ${reviews.length} published reviews`);

      // If no reviews found, return empty array - don't return a 404 error
      if (reviews.length === 0) {
        console.log("[GET /published] No published reviews found");
        return res.status(200).json({
          success: true,
          message: "No published reviews found",
          reviews: []
        });
      }

      // Then fetch all images for these reviews
      let reviewsWithImages = [...reviews]; // Create a copy of reviews

      try {
        // Extract all review IDs
        const reviewIds = reviews.map(review => review.id);
        console.log(`[GET /published] Fetching images for reviews with IDs: ${reviewIds.join(', ')}`);

        // Check if review_images table exists
        const [tableCheck] = await connection.query(`
          SELECT COUNT(*) as count FROM information_schema.tables 
          WHERE table_schema = ? AND table_name = 'review_images'
        `, [process.env.MYSQL_DATABASE || 'local_connect_db']);

        if (tableCheck[0].count === 0) {
          console.log("[GET /published] review_images table does not exist");
          // Return reviews without images if table doesn't exist
          return res.status(200).json({
            success: true,
            message: "Published reviews fetched successfully (no images table)",
            reviews: reviewsWithImages
          });
        }

        // Safe way to build the query: If no reviews, we don't do an image query
        if (reviewIds.length > 0) {
          // Use a different approach for the IN clause to handle multiple IDs correctly
          let query = 'SELECT * FROM review_images WHERE review_id IN (';
          const placeholders = reviewIds.map(() => '?').join(',');
          query += placeholders + ')';

          try {
            const [allImages] = await connection.query(query, reviewIds);
            console.log(`[GET /published] Found ${allImages.length} images for published reviews`);

            // Map images to their respective reviews
            reviewsWithImages = reviews.map(review => {
              const reviewImages = allImages.filter(img => img.review_id === review.id);
              return {
                ...review,
                reviewImages: reviewImages || []
              };
            });
          } catch (imageQueryError) {
            console.error("[GET /published] Error fetching images:", imageQueryError);
            // Still continue and return reviews without images
            console.log("[GET /published] Continuing with reviews but without images");
          }
        }
      } catch (imageError) {
        console.error("[GET /published] Error in image processing:", imageError);
        // Continue with reviews but without images in case of error
      }

      console.log("[GET /published] Successfully prepared response with", reviewsWithImages.length, "reviews");

      // Always return in the same format with a reviews array
      return res.status(200).json({
        success: true,
        message: "Published reviews fetched successfully",
        reviews: reviewsWithImages
      });
    } finally {
      console.log("[GET /published] Releasing database connection");
      connection.release();
    }
  } catch (error) {
    console.error("[GET /published] Error fetching published reviews:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      reviews: [] // Even in error case, provide an empty reviews array for consistent frontend handling
    });
  }
});

// GET /api/reviews/diagnosis - Special endpoint to diagnose database issues
router.get("/diagnosis", async (req, res) => {
  try {
    console.log("[GET /diagnosis] Starting diagnosis of reviews API...");
    const diagnosisResults = {
      serverTime: new Date().toISOString(),
      databaseConnection: false,
      mysqlVersion: null,
      tables: {
        reviews: { exists: false, count: 0, sample: null },
        review_images: { exists: false, count: 0, sample: null }
      },
      publishedReviews: { count: 0, sample: null },
      environment: {
        host: process.env.MYSQL_HOST || 'localhost',
        database: process.env.MYSQL_DATABASE || 'local_connect_db',
        user: process.env.MYSQL_USER || 'root'
      },
      actions: [],
      errors: []
    };

    // Try database initialization first
    try {
      console.log("[GET /diagnosis] 🔄 Attempting database initialization...");
      await initializeDatabase();
      diagnosisResults.actions.push('Database initialization attempted');
    } catch (initError) {
      console.error("[GET /diagnosis] ❌ Database initialization error:", initError);
      diagnosisResults.errors.push({
        source: 'database initialization',
        message: initError.message,
        code: initError.code
      });
    }

    // Check database connection
    try {
      console.log("[GET /diagnosis] 🔄 Testing database connection...");
      const connection = await pool.getConnection();
      diagnosisResults.databaseConnection = true;
      diagnosisResults.actions.push('Database connection successful');

      // Get MySQL version
      try {
        const [versionResult] = await connection.query('SELECT VERSION() as version');
        diagnosisResults.mysqlVersion = versionResult[0].version;
        diagnosisResults.actions.push('MySQL version retrieved');
      } catch (versionError) {
        diagnosisResults.errors.push({
          source: 'mysql version check',
          message: versionError.message
        });
      }

      // Check reviews table
      try {
        const [reviewTableCheck] = await connection.query(`
          SELECT COUNT(*) as count FROM information_schema.tables 
          WHERE table_schema = ? AND table_name = 'reviews'
        `, [process.env.MYSQL_DATABASE || 'local_connect_db']);

        diagnosisResults.tables.reviews.exists = reviewTableCheck[0].count > 0;

        if (diagnosisResults.tables.reviews.exists) {
          diagnosisResults.actions.push('Found reviews table');
          // Count total reviews
          const [reviewsCount] = await connection.query('SELECT COUNT(*) as count FROM reviews');
          diagnosisResults.tables.reviews.count = reviewsCount[0].count;
          diagnosisResults.actions.push(`Found ${reviewsCount[0].count} reviews`);

          // Get sample review
          if (reviewsCount[0].count > 0) {
            const [sampleReview] = await connection.query('SELECT * FROM reviews LIMIT 1');
            diagnosisResults.tables.reviews.sample = sampleReview[0];
            diagnosisResults.actions.push('Retrieved sample review');

            // Check consent and anonymous flags
            const [publishedReviewsCount] = await connection.query(
              'SELECT COUNT(*) as count FROM reviews WHERE consent_to_publish = 1 AND is_anonymous = 0'
            );
            diagnosisResults.publishedReviews.count = publishedReviewsCount[0].count;
            diagnosisResults.actions.push(`Found ${publishedReviewsCount[0].count} published reviews`);

            if (publishedReviewsCount[0].count > 0) {
              const [samplePublishedReview] = await connection.query(
                'SELECT * FROM reviews WHERE consent_to_publish = 1 AND is_anonymous = 0 LIMIT 1'
              );
              diagnosisResults.publishedReviews.sample = samplePublishedReview[0];
              diagnosisResults.actions.push('Retrieved sample published review');
            } else {
              diagnosisResults.actions.push('No published reviews found (this may be the issue)');
            }
          } else {
            diagnosisResults.actions.push('No reviews found in database (this may be the issue)');
          }
        } else {
          diagnosisResults.actions.push('Reviews table does not exist (this is an issue)');

          // Try to create the reviews table if it doesn't exist
          try {
            await connection.query(`
              CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                is_anonymous TINYINT(1) DEFAULT 0,
                order_number VARCHAR(50) NOT NULL,
                product_name VARCHAR(255),
                overall_satisfaction INT NOT NULL,
                quality_of_work INT NOT NULL,
                timeliness INT NOT NULL,
                accuracy INT NOT NULL,
                written_review TEXT NOT NULL,
                worker_name VARCHAR(255) NOT NULL,
                communication_skills INT NOT NULL,
                professionalism INT NOT NULL,
                would_recommend TINYINT(1) DEFAULT 1,
                follow_up_needed TINYINT(1) DEFAULT 0,
                has_issue TINYINT(1) DEFAULT 0,
                issue_type VARCHAR(50),
                issue_description TEXT,
                consent_to_publish TINYINT(1) DEFAULT 1,
                status VARCHAR(20) DEFAULT 'pending',
                created_at DATETIME NOT NULL
              )
            `);
            diagnosisResults.actions.push('Created reviews table');
          } catch (createTableError) {
            diagnosisResults.errors.push({
              source: 'create reviews table',
              message: createTableError.message,
              code: createTableError.code
            });
          }
        }
      } catch (reviewsTableError) {
        diagnosisResults.errors.push({
          source: 'reviews table check',
          message: reviewsTableError.message,
          code: reviewsTableError.code
        });
      }

      // Check review_images table
      try {
        const [imagesTableCheck] = await connection.query(`
          SELECT COUNT(*) as count FROM information_schema.tables 
          WHERE table_schema = ? AND table_name = 'review_images'
        `, [process.env.MYSQL_DATABASE || 'local_connect_db']);

        diagnosisResults.tables.review_images.exists = imagesTableCheck[0].count > 0;

        if (diagnosisResults.tables.review_images.exists) {
          // Count total images
          const [imagesCount] = await connection.query('SELECT COUNT(*) as count FROM review_images');
          diagnosisResults.tables.review_images.count = imagesCount[0].count;

          // Get sample image
          if (imagesCount[0].count > 0) {
            const [sampleImage] = await connection.query('SELECT * FROM review_images LIMIT 1');
            diagnosisResults.tables.review_images.sample = sampleImage[0];
          }
        }
      } catch (imagesTableError) {
        diagnosisResults.errors.push({
          source: 'review_images table check',
          message: imagesTableError.message,
          code: imagesTableError.code
        });
      }

      return res.status(200).json({
        success: true,
        message: "API diagnosis completed",
        diagnosis: diagnosisResults
      });
    } finally {
      if (diagnosisResults.databaseConnection) {
        const connection = await pool.getConnection();
        connection.release();
        diagnosisResults.actions.push('Database connection released');
      }
    }
  } catch (error) {
    console.error("[GET /diagnosis] Error during API diagnosis:", error);
    return res.status(500).json({
      success: false,
      message: `Server error during diagnosis: ${error.message}`,
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      }
    });
  }
});

// GET /api/reviews/:id - Get a specific review with its images
// This must come AFTER all specific routes
router.get("/:id", async (req, res, next) => {
  try {
    const reviewId = req.params.id;

    // Important: Special case for if the ID is actually 'published' or 'diagnosis'
    // This handles route precedence issues
    if (reviewId === 'published') {
      console.log("[GET /:id] Received 'published' as ID, redirecting to published handler");
      return next();
    }

    if (reviewId === 'diagnosis') {
      console.log("[GET /:id] Received 'diagnosis' as ID, redirecting to diagnosis handler");
      return next();
    }

    // Check if ID is a valid integer
    if (isNaN(parseInt(reviewId))) {
      console.log(`[GET /:id] Invalid ID format: ${reviewId}`);
      return res.status(404).json({
        success: false,
        message: "Review not found - Invalid ID format"
      });
    }

    const connection = await pool.getConnection();

    try {
      // Get review details with better error logging
      console.log(`[GET /:id] Fetching review with ID: ${reviewId}`);

      const [reviewRows] = await connection.query(
        "SELECT * FROM reviews WHERE id = ?",
        [reviewId]
      );

      console.log(`[GET /:id] Found ${reviewRows.length} reviews with ID ${reviewId}`);

      if (reviewRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Review not found"
        });
      }

      const review = reviewRows[0];

      // Try-catch block for image fetching to prevent query failures
      let reviewImagesRows = [];
      let additionalImagesRows = [];

      try {
        // Get review images
        [reviewImagesRows] = await connection.query(
          "SELECT * FROM review_images WHERE review_id = ? AND image_type = 'review'",
          [reviewId]
        );

        // Get additional images (if any)
        [additionalImagesRows] = await connection.query(
          "SELECT * FROM review_images WHERE review_id = ? AND image_type = 'issue'",
          [reviewId]
        );
      } catch (imageError) {
        console.error(`[GET /:id] Error fetching images for review ${reviewId}:`, imageError);
        // Continue without images if there's an error
      }

      // Combine all data
      const reviewData = {
        ...review,
        reviewImages: reviewImagesRows || [],
        additionalImages: additionalImagesRows || []
      };

      return res.status(200).json({
        success: true,
        message: "Review fetched successfully",
        review: reviewData
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(`[GET /:id] Error fetching review:`, error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`
    });
  }
});

module.exports = router;