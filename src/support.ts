// Star / share / feedback / contribute links in the title card (behind the ★ map button on phones).
export const REPO = 'mhb8898/iran-iraq-war-map';

export function setupSupport() {
  // live star count; the unauthenticated API allows 60 calls an hour per visitor, so failing quietly is fine
  fetch(`https://api.github.com/repos/${REPO}`)
    .then((r) => (r.ok ? r.json() : null))
    .then((repo: { stargazers_count?: number } | null) => {
      const n = repo?.stargazers_count;
      if (n) document.getElementById('star-count')!.textContent = String(n);
    })
    .catch(() => {});

  const share = document.getElementById('share') as HTMLButtonElement;
  share.onclick = async () => {
    // share the page as it is now, so the link opens on the same event
    const data = { title: document.title, text: 'An interactive map of the Iran–Iraq War, operation by operation', url: location.href };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        // the share sheet was dismissed
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(location.href);
      share.textContent = 'Link copied ✓';
    } catch {
      prompt('Copy this link:', location.href);
      return;
    }
    setTimeout(() => (share.textContent = 'Share'), 1800);
  };
}
