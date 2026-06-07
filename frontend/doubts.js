const API = 'http://localhost:3000/api/doubts';
const doubtForm = document.getElementById('doubtForm');
const titleInput = document.getElementById('title');
const questionInput = document.getElementById('question');
const doubtContainer = document.getElementById('doubtContainer');
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
  loadDoubts();
});

doubtForm.addEventListener('submit', addDoubt);

async function addDoubt(e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const question = questionInput.value.trim();

  if (!title || !question) {
    showNotification('Please enter both title and question details.', 'warning');
    return;
  }

  const response = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, question, userId: user._id })
  });

  const data = await response.json();

  if (response.ok) {
    showNotification('Your doubt has been posted successfully.', 'success');
    doubtForm.reset();
    loadDoubts();
  } else {
    showNotification(data.message || 'Unable to post doubt right now.', 'danger');
  }
}

async function loadDoubts() {
  const response = await fetch(API);

  if (!response.ok) {
    showNotification('Unable to load doubts. Please refresh the page.', 'danger');
    return;
  }

  const doubts = await response.json();
  let output = '';

  if (doubts.length === 0) {
    output = '<div class="alert alert-info">No doubts found yet. Post the first doubt above.</div>';
  } else {
    doubts.forEach((doubt) => {
      const ownerId = doubt.postedBy ? doubt.postedBy._id : null;
      const isOwner = ownerId === user._id;
      const isResolved = doubt.resolved;

      output += `
        <div class="card mb-3 ${isResolved ? 'border-success' : ''}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h5 class="mb-1">${doubt.title}</h5>
                <small class="text-muted">By: ${doubt.postedBy ? doubt.postedBy.name : 'Unknown'}</small>
              </div>
              <div class="text-end">
                ${isResolved ? '<span class="badge bg-success me-2">Resolved</span>' : '<span class="badge bg-warning text-dark me-2">Open</span>'}
                ${isOwner ? `<button class="btn btn-sm btn-outline-danger me-2" onclick="deleteDoubt('${doubt._id}')">Delete</button>` : ''}
                ${isOwner ? `<button class="btn btn-sm btn-outline-success" onclick="resolveDoubt('${doubt._id}', ${!isResolved})">${isResolved ? 'Mark Unresolved' : 'Mark Resolved'}</button>` : ''}
              </div>
            </div>
            <p class="mb-1 text-muted">${doubt.question}</p>
            ${isOwner ? '' : `
              <div class="mb-3">
                <label class="form-label">Clarify this doubt</label>
                <div class="input-group">
                  <input id="clarify-${doubt._id}" type="text" class="form-control form-control-sm" placeholder="Write your clarification">
                  <button class="btn btn-sm btn-outline-secondary" onclick="clarifyDoubt('${doubt._id}')">Clarify</button>
                </div>
              </div>
            `}
            ${doubt.clarifications && doubt.clarifications.length ? `
              <div class="mt-3">
                <h6>Clarifications</h6>
                ${doubt.clarifications.map((clarification) => `
                  <div class="border rounded p-2 mb-2">
                    <strong>${clarification.name}</strong>
                    <p class="mb-1">${clarification.message}</p>
                    <small class="text-muted">${new Date(clarification.createdAt).toLocaleString()}</small>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            <small class="text-muted">Posted: ${new Date(doubt.createdAt).toLocaleString()}</small>
          </div>
        </div>
      `;
    });
  }

  doubtContainer.innerHTML = output;
}

window.deleteDoubt = async function (id) {
  const response = await fetch(`${API}/${id}?userId=${user._id}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    showNotification('Doubt deleted successfully.', 'success');
    loadDoubts();
  } else {
    const data = await response.json();
    showNotification(data.message || 'Unable to delete doubt.', 'danger');
  }
};

window.clarifyDoubt = async function (doubtId) {
  const message = document.getElementById(`clarify-${doubtId}`).value.trim();
  if (!message) {
    showNotification('Please enter a clarification message.', 'warning');
    return;
  }

  const response = await fetch(`${API}/${doubtId}/clarify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user._id, name: user.name, message })
  });

  const data = await response.json();
  if (response.ok) {
    showNotification('Clarification added successfully.', 'success');
    loadDoubts();
  } else {
    showNotification(data.message || 'Unable to add clarification.', 'danger');
  }
};

window.resolveDoubt = async function (doubtId, resolve) {
  const response = await fetch(`${API}/${doubtId}/resolve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user._id, resolve })
  });

  const data = await response.json();
  if (response.ok) {
    showNotification(resolve ? 'Doubt marked resolved.' : 'Doubt marked unresolved.', 'success');
    loadDoubts();
  } else {
    showNotification(data.message || 'Unable to update doubt status.', 'danger');
  }
};