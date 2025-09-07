import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';

function ReportScreen() {
  const { auth } = useContext(AuthContext);
  const [roomNumber, setRoomNumber] = useState('');
  const [facility, setFacility] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // handle file select
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!roomNumber || !facility || !description) {
      setMessage('กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    setLoading(true);
    setMessage('');

    // FormData
    const formData = new FormData();
    formData.append('room_number', roomNumber);
    formData.append('facility', facility);
    formData.append('description', description);
    // อาจใส่ user_id ถ้ามีระบบ login
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await fetch('http://localhost:5001/api/report', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('ส่งข้อมูลแจ้งสำเร็จ');
        // reset form
        setRoomNumber('');
        setFacility('');
        setDescription('');
        setImage(null);
      } else {
        setMessage(data.message || 'ส่งข้อมูลไม่สำเร็จ');
      }
    } catch (error) {
      setMessage('ส่งข้อมูลไม่สำเร็จ: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{maxWidth: 400, margin: 'auto', padding: 20, background: '#fff', borderRadius: 8}}>
      <h2>แจ้งซ่อม/แจ้งปัญหา</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>เลขห้อง</label>
          <input
            type="text"
            value={roomNumber}
            onChange={e => setRoomNumber(e.target.value)}
            required
            style={{width: '100%', marginBottom: 10}}
          />
        </div>
        <div>
          <label>อุปกรณ์ที่พบปัญหา</label>
          <input
            type="text"
            value={facility}
            onChange={e => setFacility(e.target.value)}
            required
            style={{width: '100%', marginBottom: 10}}
          />
        </div>
        <div>
          <label>รายละเอียดปัญหา</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            style={{width: '100%', marginBottom: 10}}
          />
        </div>
        <div>
          <label>อัพโหลดรูปภาพ (ถ้ามี)</label><br/>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {image && <div style={{marginTop: 5}}>ไฟล์ที่เลือก: {image.name}</div>}
        </div>
        <button type="submit" disabled={loading} style={{width: '100%', marginTop: 20, background: '#09f', color: '#fff', padding: 10, border: 0, borderRadius: 5}}>
          {loading ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลแจ้งขำรุด'}
        </button>
        {message && <div style={{marginTop: 15, color: message.includes('สำเร็จ') ? 'green' : 'red'}}>{message}</div>}
      </form>
    </div>
  );
}

export default ReportScreen;