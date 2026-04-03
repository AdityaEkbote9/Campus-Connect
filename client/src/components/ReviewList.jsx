export const ReviewList = ({ reviews }) => {
  if (!reviews?.length) {
    return <p className="helper-text">No reviews yet.</p>;
  }

  return (
    <div className="stack">
      {reviews.map((review) => (
        <article key={review._id} className="review-card">
          <div className="review-header">
            <strong>{review.reviewerId?.name}</strong>
            <span>{review.rating}/5</span>
          </div>
          <div className="pill-row">
            <span className="pill">Comm {review.communication ?? review.rating}/5</span>
            <span className="pill">Skill {review.skillQuality ?? review.rating}/5</span>
            <span className="pill">Teamwork {review.teamwork ?? review.rating}/5</span>
            {review.flagGhosting ? <span className="pill">Ghosting flagged</span> : null}
          </div>
          <p>{review.comment || "Reliable teammate."}</p>
        </article>
      ))}
    </div>
  );
};
