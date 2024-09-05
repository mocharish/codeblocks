import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BlockList = () => {
  const [codeBlocks, setCodeBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCodeBlocks = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/code-blocks');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setCodeBlocks(data); // Assuming data is an array of code blocks
        setLoading(false);
      } catch (error) {
        console.error('Error fetching code blocks:', error);
        setLoading(false);
      }
    };

    fetchCodeBlocks();
  }, []);

  const handleClick = (blockId) => {
    navigate(`/block/${blockId}`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Choose Code Block</h1>
      {loading ? (
        <div style={styles.spinner}></div>
      ) : (
        <div style={styles.gridContainer}>
          {codeBlocks.map((block) => (
            <div key={block._id} style={styles.card}>
              <h2 style={styles.cardTitle}>{block.title}</h2>
              <button
                onClick={() => handleClick(block._id)}
                style={styles.button}
              >
                Open Block
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '50px',
    backgroundColor: '#f9f9f9',
    padding: '40px',
    borderRadius: '8px',
    maxWidth: '1200px',
    margin: '0 auto',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    color: '#333',
    fontSize: '28px',
    marginBottom: '40px',
    fontFamily: 'Arial, sans-serif',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  cardTitle: {
    fontSize: '20px',
    color: '#007bff',
    marginBottom: '15px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '6px solid #f3f3f3',
    borderTop: '6px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },
  '@keyframes spin': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
};

export default BlockList;
