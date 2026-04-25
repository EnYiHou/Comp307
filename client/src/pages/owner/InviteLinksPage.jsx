import { useEffect, useState } from "react";
import useConfirmationDialog from "../../components/confirmation/useConfirmationDialog";
import LoadingState from "../../components/loading/LoadingState";
import api from "../../shared/api/api";
import "./OwnerDashboardPage.css";

function formatDate(value) {
  if (!value) {
    return "No expiration";
  }

  return new Date(value).toLocaleString();
}

export default function InviteLinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [workingId, setWorkingId] = useState("");
  const { confirm, confirmationDialog } = useConfirmationDialog();

  async function loadLinks() {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/invites/owner");
      setLinks(response.data.data || []);
    } catch (error) {
      console.error("Invite links load error:", error);
      setMessage(error.response?.data?.message || "Failed to load invite links.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLinks();
  }, []);

  async function createLink() {
    setWorkingId("new");
    setMessage("");

    try {
      const response = await api.post("/invites");
      setLinks((prev) => [response.data.data, ...prev]);
      setMessage("Invite link created.");
    } catch (error) {
      console.error("Invite link create error:", error);
      setMessage(error.response?.data?.message || "Failed to create invite link.");
    } finally {
      setWorkingId("");
    }
  }

  async function revokeLink(link) {
    setWorkingId(link._id);
    setMessage("");

    try {
      const response = await api.patch(`/invites/${link._id}/revoke`);
      setLinks((prev) =>
        prev.map((item) => (item._id === link._id ? response.data.data : item)),
      );
      setMessage("Invite link revoked.");
    } catch (error) {
      console.error("Invite link revoke error:", error);
      setMessage(error.response?.data?.message || "Failed to revoke invite link.");
    } finally {
      setWorkingId("");
    }
  }

  async function deleteLink(link) {
    const confirmed = await confirm({
      title: "Delete invite link?",
      message: "People with this URL will no longer be able to use it.",
      confirmLabel: "Delete link",
    });
    if (!confirmed) {
      return;
    }

    setWorkingId(link._id);
    setMessage("");

    try {
      await api.delete(`/invites/${link._id}`);
      setLinks((prev) => prev.filter((item) => item._id !== link._id));
      setMessage("Invite link deleted.");
    } catch (error) {
      console.error("Invite link delete error:", error);
      setMessage(error.response?.data?.message || "Failed to delete invite link.");
    } finally {
      setWorkingId("");
    }
  }

  async function copyLink(url) {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Invite URL copied.");
    } catch {
      setMessage("Copy failed. Select and copy the URL manually.");
    }
  }

  return (
    <section className="owner-dashboard">
      <div className="owner-dashboard-hero">
        <div>
          <p className="owner-dashboard-eyebrow">Direct booking URLs</p>
          <h1>Invite Links</h1>
          <p>
            Generate URLs for slides or emails. Students who open a link see
            only your active public slots after logging in.
          </p>
        </div>
        <button
          className="owner-primary-action"
          type="button"
          disabled={workingId === "new"}
          onClick={createLink}
        >
          {workingId === "new" ? "Creating..." : "Create Invite URL"}
        </button>
      </div>

      {message && <p className="dashboard-message">{message}</p>}

      <section className="owner-dashboard-panel">
        <div className="owner-dashboard-panel-header">
          <div>
            <h2>Links</h2>
            <p>{loading ? "Loading..." : `${links.length} total`}</p>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading invite links..." variant="panel" />
        ) : links.length === 0 ? (
          <div className="owner-empty-state">
            <h3>No invite links yet</h3>
            <p>Create a URL to share your active public slots directly.</p>
          </div>
        ) : (
          <div className="owner-request-list">
            {links.map((link) => (
              <article className="owner-request-card" key={link._id}>
                <div className="owner-request-time">
                  <span>{link.isActive ? "Active" : "Revoked"}</span>
                  <strong>{formatDate(link.expiresAt)}</strong>
                </div>
                <div className="owner-request-main">
                  <h3>Invite URL</h3>
                  <p>{link.url}</p>
                </div>
                <div className="owner-request-actions">
                  <button type="button" onClick={() => copyLink(link.url)}>
                    Copy
                  </button>
                  {link.isActive && (
                    <button
                      type="button"
                      disabled={workingId === link._id}
                      onClick={() => revokeLink(link)}
                    >
                      Revoke
                    </button>
                  )}
                  <button
                    className="decline-button"
                    type="button"
                    disabled={workingId === link._id}
                    onClick={() => deleteLink(link)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      {confirmationDialog}
    </section>
  );
}
