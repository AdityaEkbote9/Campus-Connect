const getInitial = (name = "") => name.trim().charAt(0).toUpperCase() || "?";

export const Avatar = ({ name, src, size = "default", className = "" }) => {
  const avatarClassName = ["profile-avatar", size === "large" ? "profile-avatar-large" : "", className]
    .filter(Boolean)
    .join(" ");

  if (src) {
    return <img className={avatarClassName} src={src} alt={name} />;
  }

  return (
    <div className={`${avatarClassName} avatar-fallback`} role="img" aria-label={name}>
      {getInitial(name)}
    </div>
  );
};
