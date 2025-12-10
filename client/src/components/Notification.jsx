import PropTypes from "prop-types";

const Notification = ({ notification }) => {
  if (notification === null) {
    return null
  }

  return (
    <div className={`notification ${notification.type}`}>
      {notification.message}
    </div>
  )
}

Notification.propTypes = {
  notification: PropTypes.shape({
    type: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired
  })
}

export default Notification