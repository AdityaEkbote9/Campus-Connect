export const InlineNotice = ({ tone = "info", message }) => {
  if (!message) {
    return null;
  }

  return <div className={`inline-notice ${tone}`}>{message}</div>;
};
