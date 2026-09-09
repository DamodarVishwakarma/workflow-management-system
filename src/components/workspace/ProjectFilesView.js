import { useRef, useState } from 'react';
import Icon from '../common/Icon';
import apiClient from '../../services/apiClient';
import './ProjectViews.css';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ProjectFilesView({ files, onUploadFiles, onDeleteFile, canManageFiles }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const selectFiles = (event) => {
    const selectedFiles = [...event.target.files];
    const oversized = selectedFiles.find((file) => file.size > 2 * 1024 * 1024);
    if (oversized) {
      setError('Each file must be 2 MB or smaller for local storage.');
      return;
    }
    setError('');
    onUploadFiles(selectedFiles);
    event.target.value = '';
  };

  const downloadFile = async (file) => {
    try {
      const response = await apiClient.get(file.downloadUrl.replace(/^\/api\/v1/, ''), {
        responseType: 'blob',
      });
      const downloadUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch {
      setError('Unable to download this file. Please try again.');
    }
  };

  return (
    <section className="project-files-view" aria-label="Project files">
      <div className="project-view-toolbar"><div><strong>Project files</strong><span>{files.length} files</span></div>{canManageFiles && <button type="button" className="upload-button" onClick={() => inputRef.current?.click()}><Icon name="upload" size={16} /> Upload files</button>}</div>
      <input ref={inputRef} className="visually-hidden-file" type="file" multiple onChange={selectFiles} />
      {error && <p className="file-error" role="alert">{error}</p>}
      {files.length ? <div className="file-grid">{files.map((file) => <article className="file-card" key={file.id}>
        <span className="file-icon">{file.name.split('.').pop()?.slice(0, 4).toUpperCase() || 'FILE'}</span>
        <div><strong>{file.name}</strong><small>{formatBytes(file.size)} · {new Date(file.createdAt).toLocaleDateString()}</small></div>
        <div className="file-actions"><button type="button" onClick={() => downloadFile(file)} aria-label={`Download ${file.name}`}><Icon name="download" size={16} /></button>{canManageFiles && <button type="button" onClick={() => onDeleteFile(file)} aria-label={`Delete ${file.name}`}><Icon name="trash" size={16} /></button>}</div>
      </article>)}</div> : <div className="project-view-empty"><h2>No files uploaded</h2><p>Keep project documents and assets together here.</p>{canManageFiles && <button type="button" onClick={() => inputRef.current?.click()}>Upload your first file</button>}</div>}
    </section>
  );
}

export default ProjectFilesView;
