const styles = {
    cardContainer: {
      position: 'absolute',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      padding: '20px',
      display: 'flex',
      overflow:'scroll',
      flexDirection: 'column',
      gap: '10px',
      width: '320px',
      maxWidth: '90%',
      maxHeight: '90%',
    },
    inputField: {
      width: '100%',
      padding: '10px',
      fontSize: '16px',
      borderRadius: '4px',
      border: '1px solid #ccc',
    },

    gFont: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        background: 'white' 
      },
 
    button: {
      padding: '10px',
      fontSize: '16px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      background: '#f0f0f0',
      cursor: 'pointer',
    },
    buttonD: {
        padding: '10px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        background: '#f0f0f0',
        cursor: 'pointer',
      },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '10px',
    },
    cancelButton: {
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      background: '#ff4d4d',
      color: 'white',
      cursor: 'pointer',
    },
    submitButton: {
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      background: '#3498db',
      color: 'white',
      cursor: 'pointer',
    },
    submitButtonD: {
        padding: '10px 20px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        background: '#6fa371',
        color: 'white',
        cursor: 'pointer',
      },
    spinnerStyle: {
        border: '3px solid #f3f3f3', // Light grey
        borderTop: '3px solid #3498db', // Blue
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 2s linear infinite'
      },
    
    containerStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50px'
      },
      container: {
        display: 'flex',
        alignItems: 'center' // This aligns items vertically in the center of the container
      },
      stableIcon: {
        width: '50px',  // Set the width of the image
        height: '50px', // Set the height of the image
        marginRight: '20px' // Adds some space between the image and the text
      },
      stableIconSmall: {
        width: '20px',  // Set the width of the image
        height: '20px', // Set the height of the image
        marginRight: '5px' // Adds some space between the image and the text
      },
      textBlock: {
        display: 'flex',
        flexDirection: 'column', // Aligns the text vertically
        justifyContent: 'center' // Centers the text blocks vertically
      },
      textRow: {
        display: 'flex',
        alignItems: 'center' // Aligns the amount and description in a single row
      }
      
};

export default styles;