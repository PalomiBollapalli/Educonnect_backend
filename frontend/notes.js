const API = 'http://localhost:3000/api/notes';
const noteForm = document.getElementById('noteForm');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const notesContainer = document.getElementById('notesContainer');
const alertContainer = document.getElementById('alertContainer');

function showNotification(message, type = 'success') {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  window.location.href = 'login.html';
}

window.addEventListener('DOMContentLoaded', () => {
  loadNotes();
});

noteForm.addEventListener('submit', addNote);

async function addNote(e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) {
    showNotification('Please enter a title for the note.', 'warning');
    return;
  }

  const response = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, description, userId: user._id })
  });

  const data = await response.json();
  if (response.ok) {
    showNotification('Note added successfully!', 'success');
    noteForm.reset();
    loadNotes();
  } else {
    showNotification(data.message || 'Unable to add note.', 'danger');
  }
}

async function loadNotes() {
  const response = await fetch(API);
  if (!response.ok) {
    showNotification('Unable to load notes. Please refresh.', 'danger');
    return;
  }

  const notes = await response.json();
  let output = '';

  if (notes.length === 0) {
    output = '<div class="alert alert-info">No notes found yet. Add your first note above.</div>';
  } else {
    notes.forEach((note) => {
      const ownerId = note.uploadedBy ? note.uploadedBy._id : null;
      const isOwner = ownerId === user._id;
      const averageRating = note.ratings && note.ratings.length
        ? (note.ratings.reduce((sum, rating) => sum + rating.score, 0) / note.ratings.length).toFixed(1)
        : null;
      const existingRating = note.ratings?.find((rating) => rating.user?.toString() === user._id);
      const existingReview = note.reviews?.find((review) => review.user?.toString() === user._id);
      const ratingValue = existingRating ? existingRating.score : '';
      const reviewValue = existingReview ? existingReview.comment : '';
      const reviewButtonText = existingReview ? 'Update review' : 'Review';
      const rateButtonText = existingRating ? 'Update rating' : 'Submit';
      const reviewCount = note.reviews?.length || 0;
      const ratingCount = note.ratings?.length || 0;
      const sharedBy = note.uploadedBy ? note.uploadedBy.name : 'Unknown';

      output += `
        <div class="card mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h5 class="mb-1">${note.title}</h5>
                <small class="text-muted">Shared by: ${sharedBy}</small>
              </div>
              ${isOwner ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteNote('${note._id}')">Delete</button>` : ''}
            </div>
            <p class="mb-1 text-muted">${note.description || 'No description provided.'}</p>
            <div class="mb-3">
              ${ratingCount ? `<span class="badge bg-secondary me-2">Average rating: ${averageRating} / 5</span>` : '<span class="badge bg-info">No ratings yet</span>'}
              ${ratingCount ? `<span class="badge bg-secondary me-2">(${ratingCount} rating${ratingCount === 1 ? '' : 's'})</span>` : ''}
              ${reviewCount ? `<span class="badge bg-success">${reviewCount} review${reviewCount === 1 ? '' : 's'}</span>` : ''}
            </div>
            ${ratingCount || reviewCount ? '<p class="small text-muted mb-3">Average rating and reviews are visible to everyone.</p>' : ''}
            ${isOwner ? '' : `
              <div class="mb-3">
                <label class="form-label">Rate this note</label>
                <div class="input-group mb-2">
                  <input id="rating-${note._id}" type="number" min="1" max="5" class="form-control form-control-sm" placeholder="1-5" value="${ratingValue}">
                  <button class="btn btn-sm btn-outline-primary" onclick="rateNote('${note._id}')">${rateButtonText}</button>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Leave a review</label>
                <div class="input-group">
                  <input id="review-${note._id}" type="text" class="form-control form-control-sm" placeholder="Write a comment" value="${reviewValue}">
                  <button class="btn btn-sm btn-outline-secondary" onclick="reviewNote('${note._id}')">${reviewButtonText}</button>
                </div>
              </div>
            `}
            ${note.reviews && note.reviews.length ? `
              <div class="mt-3">
                <h6>Reviews</h6>
                ${note.reviews.map((review) => `
                  <div class="border rounded p-2 mb-2">
                    <strong>${review.name}</strong>
                    <p class="mb-1">${review.comment}</p>
                    <small class="text-muted">${new Date(review.createdAt).toLocaleString()}</small>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            <small class="text-muted">Uploaded: ${new Date(note.createdAt).toLocaleString()}</small>
          </div>
        </div>
      `;
    });
  }

  notesContainer.innerHTML = output;
}

window.deleteNote = async function (id) {
  const response = await fetch(`${API}/${id}?userId=${user._id}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    showNotification('Note deleted successfully.', 'success');
    loadNotes();
  } else {
    const data = await response.json();
    showNotification(data.message || 'Unable to delete note.', 'danger');
  }
};

window.rateNote = async function (noteId) {
  const score = Number(document.getElementById(`rating-${noteId}`).value);
  if (!score || score < 1 || score > 5) {
    showNotification('Please enter a rating between 1 and 5.', 'warning');
    return;
  }

  const response = await fetch(`${API}/${noteId}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user._id, name: user.name, score })
  });

  const data = await response.json();
  if (response.ok) {
    showNotification('Rating saved.', 'success');
    loadNotes();
  } else {
    showNotification(data.message || 'Unable to rate note.', 'danger');
  }
};

window.reviewNote = async function (noteId) {
  const comment = document.getElementById(`review-${noteId}`).value.trim();
  if (!comment) {
    showNotification('Please enter a review comment.', 'warning');
    return;
  }

  const response = await fetch(`${API}/${noteId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user._id, name: user.name, comment })
  });

  const data = await response.json();
  if (response.ok) {
    showNotification('Review submitted.', 'success');
    loadNotes();
  } else {
    showNotification(data.message || 'Unable to submit review.', 'danger');
  }
};