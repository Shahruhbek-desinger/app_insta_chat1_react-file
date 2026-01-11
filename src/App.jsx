import { useEffect, useRef, useState } from "react";

const API = "https://app-insta-chat1-3.onrender.com";

export default function App() {
  const [uid, setUid] = useState(localStorage.uid || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [convs, setConvs] = useState([]);
  const [current, setCurrent] = useState(null);
  const [messages, setMessages] = useState([]);

  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [typing, setTyping] = useState("");
  const [online, setOnline] = useState(false);

  const bottomRef = useRef(null);

  // ---------------- AUTH ----------------

  function login() {
    fetch(API + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          localStorage.uid = d.user_id;
          setUid(d.user_id);
        } else alert("Login xato");
      });
  }

  function register() {
    fetch(API + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
    }).then(() => alert("Account created"));
  }

  // ---------------- LOADERS ----------------

  function loadConvs() {
    fetch(API + "/conversations/" + uid)
      .then((r) => r.json())
      .then(setConvs);
  }

  function openChat(c) {
    setCurrent(c);
    fetch(API + "/messages/" + c.chat_id)
      .then((r) => r.json())
      .then((d) => {
        setMessages(d);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      });
  }

  // ---------------- SEND ----------------

  function send() {
    if (!text.trim() || !current) return;

    const msg = text;

    setMessages([...messages, { sender: uid, text: msg }]);
    setText("");

    fetch(API + "/send", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `chat_id=${current.chat_id}&sender=${uid}&text=${encodeURIComponent(msg)}`,
    });

    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  // ---------------- SEARCH ----------------

useEffect(() => {
  if (!search.trim()) {
    setResults([]);
    return;
  }

  fetch(API + "/search?q=" + encodeURIComponent(search))
    .then((r) => {
      if (!r.ok) throw new Error("Search API error");
      return r.json();
    })
    .then((data) => {
      if (Array.isArray(data)) {
        setResults(data);
      } else {
        setResults([]);
      }
    })
    .catch(() => setResults([]));
}, [search]);


  // ---------------- ONLINE + REALTIME ----------------

  useEffect(() => {
    if (!uid) return;

    const ping = setInterval(() => {
      fetch(API + "/online", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `uid=${uid}`,
      });
    }, 5000);

    const convTimer = setInterval(loadConvs, 2000);
    const msgTimer = setInterval(() => {
      if (current) openChat(current);
    }, 1000);

    const typingTimer = setInterval(() => {
      if (!current) return;

      fetch(API + "/typing/" + current.chat_id)
        .then((r) => r.text())
        .then((t) => setTyping(t && t !== uid ? "Typing..." : ""));

      fetch(API + "/online/" + current.user_id)
        .then((r) => r.json())
        .then(setOnline);
    }, 1500);

    return () => {
      clearInterval(ping);
      clearInterval(convTimer);
      clearInterval(msgTimer);
      clearInterval(typingTimer);
    };
  }, [uid, current]);

  // ---------------- UI ----------------

  if (!uid)
    return (
      <div className="login">
        <h2>Messenger</h2>
        <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button onClick={login}>Login</button>
        <button onClick={register}>Register</button>
      </div>
    );

  return (
    <div className="app">
      {/* LEFT */}
      <div className="left">
        <div className="search-box">
          <input
            placeholder="Search user"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="chat-list">
          {search &&
            results.map((u) => (
              <div
                key={u.id}
                className="conv"
                onClick={() => {
                  fetch(API + "/start_chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `a=${uid}&b=${u.id}`,
                  })
                    .then((r) => r.json())
                    .then((c) => {
                      openChat({ chat_id: c.chat_id, username: u.username, user_id: u.id });
                      setSearch("");
                      setResults([]);
                      loadConvs();
                    });
                }}
              >
                {u.username}
              </div>
            ))}

          {!search &&
            convs.map((c) => (
              <div key={c.chat_id} className="conv" onClick={() => openChat(c)}>
                <b>{c.username}</b>
                <p>{c.last_message}</p>
              </div>
            ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="right">
        <div className="header">
          {current?.username || "Select chat"}
          {current && <span>{online ? "🟢 Online" : "⚫ Offline"}</span>}
          <span>{typing}</span>
        </div>

        <div className="msgs">
          {messages.map((m, i) => (
            <div key={i} className={m.sender === uid ? "me" : "them"}>
              {m.text}
            </div>
          ))}
          <div ref={bottomRef}></div>
        </div>

        <div className="send-box">
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (current && e.target.value.trim() !== "") {
                fetch(API + "/typing", {
                  method: "POST",
                  headers: { "Content-Type": "application/x-www-form-urlencoded" },
                  body: `chat_id=${current.chat_id}&uid=${uid}`,
                });
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Message"
          />
          <button onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}
