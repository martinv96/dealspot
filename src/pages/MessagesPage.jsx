import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaPaperPlane, FaRegCommentDots, FaTimes, FaUserCircle } from "react-icons/fa";
import PrivateHeader from "../components/PrivateHeader";
import SiteFooter from "../components/SiteFooter";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

function formatTime(dateValue) {
  if (!dateValue) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateValue));
}

function formatDateTime(dateValue) {
  if (!dateValue) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateValue));
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [error, setError] = useState("");
  const [sendLoading, setSendLoading] = useState(false);

  const pollRef = useRef(null);
  const endRef = useRef(null);
  const previousThreadLengthRef = useRef(0);
  const selectedRef = useRef(null);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const selectedKey = useMemo(() => {
    if (!selected) return "";
    return `${selected.otherUser.id}-${selected.annonceId || 0}`;
  }, [selected]);

  const selectedIsDraftConversation = Boolean(selected?.isDraftConversation);
  const queryUserId = useMemo(
    () => Number.parseInt(searchParams.get("userId") || "", 10) || null,
    [searchParams]
  );
  const queryAnnonceId = useMemo(
    () => Number.parseInt(searchParams.get("annonceId") || "", 10) || null,
    [searchParams]
  );
  const queryPseudo = useMemo(() => searchParams.get("pseudo") || "Utilisateur", [searchParams]);
  const queryAnnonceTitre = useMemo(() => searchParams.get("annonceTitre") || "Annonce", [searchParams]);

  const loadConversations = useCallback(async (keepSelection = true) => {
    const res = await api.get("/messages/conversations");
    const nextList = res.data?.conversations || [];
    setConversations(nextList);

    const fromQueryUser = queryUserId;
    const fromQueryAnnonce = queryAnnonceId;

    if (fromQueryUser && (!selectedKey || !keepSelection)) {
      const existing = nextList.find(
        (c) => c.otherUser?.id === fromQueryUser && (c.annonceId || 0) === (fromQueryAnnonce || 0)
      );

      if (existing) {
        setSelected(existing);
      } else {
        setSelected({
          isDraftConversation: true,
          otherUser: { id: fromQueryUser, pseudo: queryPseudo },
          annonceId: fromQueryAnnonce || null,
          annonce: fromQueryAnnonce
            ? { id: fromQueryAnnonce, titre: queryAnnonceTitre }
            : null,
          lastMessage: "",
          lastDate: null,
          unreadCount: 0
        });
      }
      return;
    }

    if (!keepSelection || !selectedKey) {
      setSelected(nextList[0] || null);
      return;
    }

    const selectedStillExists = nextList.find(
      (c) => `${c.otherUser?.id}-${c.annonceId || 0}` === selectedKey
    );
    if (!selectedStillExists) {
      // conversation temporaire garder tant que le message n'esqt pas envoyé
      if (keepSelection && selectedIsDraftConversation) {
        return;
      }
      setSelected(nextList[0] || null);
    }
  }, [queryAnnonceId, queryAnnonceTitre, queryPseudo, queryUserId, selectedIsDraftConversation, selectedKey]);

  const loadThread = useCallback(async (current, options = {}) => {
    const { silent = false } = options;

    if (!current?.otherUser?.id) {
      setThread([]);
      return;
    }

    if (!silent) {
      setLoadingThread(true);
    }
    try {
      const res = await api.get(`/messages/threads/${current.otherUser.id}`, {
        params: current.annonceId ? { annonceId: current.annonceId } : undefined
      });
      setThread(res.data?.messages || []);

      // Remise a zero immediate du compteur non lu pour la conversation ouverte
      const openedKey = `${current.otherUser.id}-${current.annonceId || 0}`;
      setConversations((prev) => {
        let changed = false;
        const next = prev.map((conv) => {
          const key = `${conv.otherUser.id}-${conv.annonceId || 0}`;
          if (key === openedKey && conv.unreadCount > 0) {
            changed = true;
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        });
        return changed ? next : prev;
      });
      setSelected((prev) => {
        if (!prev || prev.unreadCount === 0) return prev;
        return { ...prev, unreadCount: 0 };
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Impossible de charger la conversation.");
    } finally {
      if (!silent) {
        setLoadingThread(false);
      }
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        setLoadingList(true);
        setError("");
        await loadConversations(false);
      } catch (err) {
        setError(err?.response?.data?.message || "Impossible de charger vos messages.");
      } finally {
        setLoadingList(false);
      }
    }
    init();
  }, [loadConversations]);

  useEffect(() => {
    const currentSelected = selectedRef.current;

    if (!currentSelected) {
      setThread([]);
      return;
    }

    const isDraftWithoutMessages = Boolean(
      currentSelected.isDraftConversation && thread.length === 0
    );

    if (isDraftWithoutMessages) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
      return;
    }

    loadThread(currentSelected);

    if (pollRef.current) {
      clearInterval(pollRef.current);
    }

    pollRef.current = setInterval(() => {
      loadThread(selectedRef.current, { silent: true });
      loadConversations(true);
    }, 4500);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadConversations, loadThread, selectedKey, thread.length]);

  useEffect(() => {
    const previousLength = previousThreadLengthRef.current;
    previousThreadLengthRef.current = thread.length;

    if (thread.length > previousLength && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "auto", block: "end" });
    }
  }, [thread.length]);

  async function handleSend(e) {
    e.preventDefault();
    const contenu = draft.trim();
    if (!contenu || !selected?.otherUser?.id) return;

    try {
      setSendLoading(true);
      await api.post("/messages", {
        receiverId: selected.otherUser.id,
        annonceId: selected.annonceId || undefined,
        contenu
      });
      setDraft("");
      await loadThread(selected, { silent: true });
      await loadConversations(true);
      setSearchParams({});
    } catch (err) {
      setError(err?.response?.data?.message || "Envoi impossible.");
    } finally {
      setSendLoading(false);
    }
  }

  async function handleDeleteConversation(conv) {
    const confirmed = window.confirm("Supprimer cette conversation ?");
    if (!confirmed) return;

    try {
      await api.delete(`/messages/threads/${conv.otherUser.id}`, {
        params: conv.annonceId ? { annonceId: conv.annonceId } : undefined
      });

      const removedKey = `${conv.otherUser.id}-${conv.annonceId || 0}`;
      setConversations((prev) => prev.filter((item) => `${item.otherUser.id}-${item.annonceId || 0}` !== removedKey));
      if (selectedKey === removedKey) {
        setSelected(null);
        setThread([]);
      }
      await loadConversations(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Suppression impossible.");
    }
  }

  async function handleDeleteMessage(messageId) {
    try {
      await api.delete(`/messages/${messageId}`);
      setThread((prev) => prev.filter((msg) => msg.id !== messageId));
      await loadConversations(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Suppression du message impossible.");
    }
  }

  return (
    <div className="page-shell">
      <PrivateHeader />

      <main className="page-main messages-page">
        <div className="messages-title">
          <h1><FaRegCommentDots /> Messages</h1>
          <p>Discutez avec les acheteurs et vendeurs</p>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <section className="messages-layout">
          <aside className="messages-list-card">
            <div className="messages-list-head">Conversations</div>

            {loadingList ? (
              <p className="center-loader">Chargement...</p>
            ) : conversations.length === 0 && !selected ? (
              <p className="empty-listing-message">Aucune conversation pour le moment.</p>
            ) : (
              <div className="messages-list">
                {conversations.map((conv) => {
                  const key = `${conv.otherUser.id}-${conv.annonceId || 0}`;
                  const isActive = key === selectedKey;
                  return (
                    <div
                      key={key}
                      className={`messages-conversation-item${isActive ? " active" : ""}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelected(conv);
                        setConversations((prev) =>
                          prev.map((item) => {
                            const itemKey = `${item.otherUser.id}-${item.annonceId || 0}`;
                            return itemKey === key ? { ...item, unreadCount: 0 } : item;
                          })
                        );
                        setSearchParams({});
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelected(conv);
                          setConversations((prev) =>
                            prev.map((item) => {
                              const itemKey = `${item.otherUser.id}-${item.annonceId || 0}`;
                              return itemKey === key ? { ...item, unreadCount: 0 } : item;
                            })
                          );
                          setSearchParams({});
                        }
                      }}
                    >
                      <div className="messages-conversation-avatar"><FaUserCircle /></div>
                      <div className="messages-conversation-body">
                        <strong>{conv.otherUser.pseudo}</strong>
                        <span>{conv.annonce?.titre || "Conversation"}</span>
                        <p>{conv.lastMessage || "Commencer la discussion"}</p>
                      </div>
                      <div className="messages-conversation-meta">
                        <span>{formatTime(conv.lastDate)}</span>
                        {!isActive && conv.unreadCount > 0 ? <em>{conv.unreadCount}</em> : null}
                        <button
                          type="button"
                          className="messages-delete-conversation-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv);
                          }}
                          title="Supprimer la conversation"
                          aria-label="Supprimer la conversation"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </aside>

          <section className="messages-thread-card">
            {selected ? (
              <>
                <header className="messages-thread-head">
                  <div>
                    <strong>{selected.otherUser.pseudo}</strong>
                    <p>{selected.annonce?.titre || "Conversation générale"}</p>
                  </div>
                  {selected.annonce?.id ? (
                    <Link to={`/annonces/${selected.annonce.id}`} className="btn btn-outline messages-annonce-link">
                      Voir annonce
                    </Link>
                  ) : null}
                </header>

                <div className="messages-thread-body">
                  {loadingThread ? <p className="center-loader">Chargement...</p> : null}

                  {!loadingThread && thread.length === 0 ? (
                    <p className="empty-listing-message">Envoyez le premier message.</p>
                  ) : (
                    thread.map((msg) => {
                      const mine = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={`message-bubble-row${mine ? " mine" : ""}`}>
                          <div className={`message-bubble${mine ? " mine" : ""}`}>
                            {mine ? (
                              <button
                                type="button"
                                className="messages-delete-message-btn"
                                onClick={() => handleDeleteMessage(msg.id)}
                                title="Supprimer ce message"
                                aria-label="Supprimer ce message"
                              >
                                <FaTimes />
                              </button>
                            ) : null}
                            <p>{msg.contenu}</p>
                            <small>{formatDateTime(msg.created_at)}</small>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={endRef} />
                </div>

                <form className="messages-thread-input" onSubmit={handleSend}>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Ecrivez votre message..."
                  />
                  <button type="submit" className="btn btn-contact" disabled={sendLoading || !draft.trim()}>
                    <FaPaperPlane />
                  </button>
                </form>
              </>
            ) : (
              <div className="messages-thread-empty">
                <FaRegCommentDots />
                <p>Selectionnez une conversation à gauche.</p>
              </div>
            )}
          </section>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
