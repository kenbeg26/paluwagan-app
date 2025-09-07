import { Button, Modal } from 'react-bootstrap';
import { Notyf } from 'notyf';

const notyf = new Notyf(); // Create a single Notyf instance outside component

export default function ArchiveProduct({ product, isActive, fetchData, show, onHide }) {

  const disableToggle = () => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/product/${product._id}/archive`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === "Product archived successfully") {
          notyf.success("Successfully Disabled");
          fetchData();
          onHide(); // Close the modal after the notification
        } else {
          // Consider showing an error notification here as well
          console.error("Failed to disable product:", data);
        }
      })
      .catch(error => {
        console.error("Error disabling product:", error);
        // Optionally show an error notification
      });
  };

  const activateToggle = () => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/product/${product._id}/activate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success === true) {
          notyf.success("Successfully Activated");
          fetchData();
          onHide(); // Close the modal after the notification
        } else {
          notyf.error("Something Went Wrong");
          fetchData();
        }
      })
      .catch(error => {
        console.error("Error activating product:", error);
        // Optionally show an error notification
      });
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {isActive ? 'Confirm Disable' : 'Confirm Activation'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isActive
          ? 'Are you sure you want to disable this product?'
          : 'Are you sure you want to activate this product?'}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        {isActive ? (
          <Button variant="danger" onClick={disableToggle}>Disable</Button>
        ) : (
          <Button variant="success" onClick={activateToggle}>Activate</Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}