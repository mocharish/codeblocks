import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useNavigate, useParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const socket = io('http://localhost:3001');

const CodeBlockPage = () => {
  const { blockId } = useParams();
  const [role, setRole] = useState('Loading...');
  const [codeBlock, setCodeBlock] = useState('');
  const [title, setTitle] = useState('');
  const [studentCount, setStudentCount] = useState(0);
  const navigate = useNavigate();
  const [showSmiley, setShowSmiley] = useState(false);

  useEffect(() => {
    if (!blockId) {
      console.error('No blockId provided in route parameters');
      return;
    }

    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setRole(storedRole);
    }

    // Join the code block room
    socket.emit('joinCodeBlock', blockId);

    socket.on('role', (assignedRole) => {
      setRole(assignedRole);
      localStorage.setItem('role', assignedRole);
    });

    socket.on('codeBlock', (codeData) => {
      setCodeBlock(codeData.code);
      setTitle(codeData.title);
    });

    socket.on('studentCount', (count) => {
      setStudentCount(count);
    });

    socket.on('mentorLeft', (originalCode) => {
      console.log('Mentor has left. Resetting code and redirecting to lobby.');

      if (role === 'student') {
        alert('The mentor has left. Redirecting to the lobby.');
        setCodeBlock(originalCode);  // Reset the code
        navigate('/');  // Redirect to the lobby
      }
    });

    socket.on('solutionMatched', (matched) => {
      if (matched) {
        setShowSmiley(true);
      }
    });

    socket.on('reconnect', () => {
      const storedRole = localStorage.getItem('role');
      if (blockId && storedRole) {
        socket.emit('joinCodeBlock', blockId);
      }
    });

    // Fetch code block on initial load
    const fetchCodeBlock = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/code-blocks/${blockId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const codeData = await response.json();
        setCodeBlock(codeData.code);
        setTitle(codeData.title);
      } catch (error) {
        console.error('Error fetching code block:', error);
      }
    };

    fetchCodeBlock(); // Fetch code block on component mount

    // Cleanup event listeners on unmount
    return () => {
      socket.off('role');
      socket.off('codeBlock');
      socket.off('studentCount');
      socket.off('mentorLeft');
      socket.off('solutionMatched');
      socket.off('reconnect');
    };
  }, [blockId, role, navigate]);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCodeBlock(newCode);
    socket.emit('updateCode', newCode);
  };

  return (
    <div>
      <h1>{title || 'Code Block'}</h1>
      <p>Role: {role}</p>
      <p>Number of Students: {studentCount}</p>
      <SyntaxHighlighter language="javascript" style={solarizedlight}>
        {codeBlock}
      </SyntaxHighlighter>
      {role === 'student' && (
        <textarea
          value={codeBlock}
          onChange={handleCodeChange}
          style={{ width: '100%', height: '300px', fontFamily: 'monospace' }}
        />
      )}
      {showSmiley && (
        <div style={{ fontSize: '100px', textAlign: 'center', marginTop: '20px' }}>
          😃
        </div>
      )}
    </div>
  );
};

export default CodeBlockPage;
