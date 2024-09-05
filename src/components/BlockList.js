import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BlockList = () => {
  const [codeBlocks, setCodeBlocks] = useState([]);
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
      } catch (error) {
        console.error('Error fetching code blocks:', error);
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
      <div style={styles.buttonContainer}>
        {codeBlocks.map((block) => (
          <button
            key={block._id} // Use _id from MongoDB
            onClick={() => handleClick(block._id)}
            style={styles.button}
          >
            {block.title}
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '50px',
    backgroundColor: '#f0f0f0',
    padding: '20px',
    borderRadius: '8px',
  },
  heading: {
    color: '#333',
    fontSize: '24px',
    marginBottom: '20px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    margin: '10px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
  },
};

export default BlockList;
