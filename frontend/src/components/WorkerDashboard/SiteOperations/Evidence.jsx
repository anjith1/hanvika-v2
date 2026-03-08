import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5003';
const getToken = () => localStorage.getItem('workerToken') || localStorage.getItem('authToken');

export default function Evidence() {
    const [evidence, setEvidence] = useState([]);
    const [loading, setLoading] = useState(true);
    const [preview, setPreview] = useState(null);
    const [desc, setDesc] = useState('');
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState('');
    const fileRef = useRef(null);

    useEffect(() => { fetchEvidence(); }, []);

    const fetchEvidence = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/api/evidence`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            setEvidence(res.data.data || []);
        } catch { setEvidence([]); }
        finally { setLoading(false); }
    };

    const handleFile = e => {
        const f = e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = ev => setPreview({ file: f, url: ev.target.result });
        reader.readAsDataURL(f);
    };

    const handleUpload = async () => {
        if (!preview) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('image', preview.file);
            fd.append('description', desc);
            await axios.post(`${API}/api/evidence`, fd, {
                headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'multipart/form-data' },
            });
            setMsg('✅ Evidence uploaded!');
            setPreview(null); setDesc('');
            if (fileRef.current) fileRef.current.value = '';
            fetchEvidence();
        } catch (err) {
            setMsg(`❌ ${err.response?.data?.error || 'Upload failed.'}`);
        } finally { setUploading(false); setTimeout(() => setMsg(''), 3000); }
    };

    return (
        <div className="wd-module">
            <div className="wd-module-header"><h3>📷 Photo Evidence</h3></div>

            {/* Upload area */}
            <div className="wd-upload-area" onClick={() => fileRef.current?.click()}>
                {preview ? (
                    <img src={preview.url} alt="preview" style={{ maxHeight: 160, borderRadius: 8, objectFit: 'cover' }} />
                ) : (
                    <>
                        <div style={{ fontSize: 32 }}>📷</div>
                        <div style={{ color: '#64748b', fontSize: 13 }}>Click to select image</div>
                    </>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            </div>

            {preview && (
                <div className="wd-form" style={{ marginTop: 12 }}>
                    <textarea className="wd-input wd-textarea" placeholder="Describe what this photo shows..."
                        value={desc} onChange={e => setDesc(e.target.value)} rows={2} />
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="wd-btn wd-btn-orange" onClick={handleUpload} disabled={uploading}>
                            {uploading ? 'Uploading...' : '⬆️ Upload Evidence'}
                        </button>
                        <button className="wd-btn-sm" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
                            onClick={() => { setPreview(null); setDesc(''); if (fileRef.current) fileRef.current.value = ''; }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {msg && <div className="wd-msg" style={{ marginTop: 8 }}>{msg}</div>}

            {/* Gallery */}
            {loading ? <div className="wd-loading">Loading...</div> : (
                evidence.length === 0 ? (
                    <div className="wd-empty">No evidence uploaded yet.</div>
                ) : (
                    <div className="wd-evidence-grid">
                        {evidence.map(e => (
                            <div key={e._id} className="wd-evidence-item">
                                <img src={`${API}${e.imageUrl}`} alt="evidence"
                                    onError={ev => { ev.target.style.display = 'none'; }}
                                />
                                {e.description && <div className="wd-evidence-desc">{e.description}</div>}
                                <div className="wd-card-date">{new Date(e.uploadedAt).toLocaleString('en-IN')}</div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
