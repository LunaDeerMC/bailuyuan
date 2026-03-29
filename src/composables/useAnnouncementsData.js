function normalizeImportantMessages(payload) {
  if (!Array.isArray(payload?.important)) {
    return [];
  }

  return payload.important
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeAnnouncementsList(payload) {
  if (Array.isArray(payload)) {
    return payload.filter(Boolean);
  }

  if (Array.isArray(payload?.announcements)) {
    return payload.announcements.filter(Boolean);
  }

  return [];
}

function normalizeAnnouncementsPayload(payload) {
  return {
    important: normalizeImportantMessages(payload),
    announcements: normalizeAnnouncementsList(payload),
  };
}

let announcementsRequest = null;

export function fetchAnnouncementsData(options = {}) {
  const { force = false } = options;

  if (force || !announcementsRequest) {
    announcementsRequest = fetch('/data/announcements.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load announcements: ${response.status}`);
        }

        return response.json();
      })
      .then(normalizeAnnouncementsPayload)
      .catch((error) => {
        announcementsRequest = null;
        throw error;
      });
  }

  return announcementsRequest.then(({ important, announcements }) => ({
    important: [...important],
    announcements: [...announcements],
  }));
}