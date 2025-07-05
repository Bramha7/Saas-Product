import axios from "../config/axios.js";
import React, { useEffect, useState, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../context/User.Context.jsx";
import {
  initializeSocket,
  sendMessage,
  receiveMessage,
} from "../config/socket.js";
import Markdown from "markdown-to-jsx";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const Project = () => {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [projects, setProjects] = useState([]);
  const [addedUsers, setAddedUsers] = useState([]);
  const [projectFetch, setProjectFetch] = useState(location.state.project);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { user } = useContext(UserContext);
  const messageBox = useRef();

  function send() {
    const data = {
      message,
      sender: user?.user?._id,
      senderEmail: user?.user?.email,
    };
    sendMessage("project-message", data);
    setMessages((prev) => [...prev, data]);
    setMessage("");
  }

  useEffect(() => {
    initializeSocket(projectFetch._id);

    receiveMessage("project-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    axios.get(`/fetch/${location.state.project._id}`).then((res) => {
      setProjectFetch(res.data.project);
      setAddedUsers(res.data.project.users || []);
    });

    axios
      .get("/all")
      .then((res) => {
        setProjects(res.data.projects || []);
      })
      .catch((err) => {
        console.error("Error fetching projects:", err);
      });
  }, []);

  useEffect(() => {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }, [messages]);

  const toggleUserSelect = (user) => {
    setSelectedUserIds((prev) =>
      prev.includes(user._id)
        ? prev.filter((id) => id !== user._id)
        : [...prev, user._id],
    );
  };

  const handleAddCollaborators = () => {
    if (projects.length > 0) {
      const projectUsers = projects[0].users;
      const selectedUsers = projectUsers.filter((user) =>
        selectedUserIds.includes(user._id),
      );
      setAddedUsers(selectedUsers);

      axios
        .put("/add-user", {
          projectId: location.state.project._id,
          users: Array.from(selectedUserIds),
        })
        .then(() => {
          setIsModalOpen(false);
          setSelectedUserIds([]);
        })
        .catch((err) => {
          console.error("Failed to add collaborators:", err);
        });
    }
  };

  return (
    <>
      <main className="h-screen w-screen flex">
        <section className="left flex flex-col h-full w-[400px] bg-slate-300">
          <header className="flex justify-between items-center w-full bg-slate-100 px-4 py-4 border-b">
            <button
              className="Collborators flex items-center gap-3 text-base font-medium hover:opacity-80 transition"
              onClick={() => setIsModalOpen(true)}
            >
              <i className="ri-user-add-line text-2xl leading-none"></i>
              <span className="leading-none">Add Collaborators</span>
            </button>

            <button
              className="p-3 rounded-full hover:bg-slate-200 transition"
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            >
              <i className="ri-group-3-fill text-2xl"></i>
            </button>
          </header>

          {addedUsers.length > 0 && (
            <div className="bg-slate-100 p-4 border-b">
              <h2 className="font-medium mb-2 text-slate-700">
                Collaborators: {addedUsers.length}
              </h2>
            </div>
          )}

          <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
            <div
              ref={messageBox}
              className="message-box p-1 flex-grow flex flex-col gap-2 overflow-auto max-h-full scrollbar-hide"
            >
              {messages.map((msg, index) => {
                const isCurrentUser = msg.sender === user?.user?._id;
                return (
                  <div
                    key={index}
                    className={`${
                      isCurrentUser
                        ? "messages self-end bg-blue-100"
                        : "incomming bg-white"
                    } flex flex-col w-fit max-w-[90%] px-3 py-2 rounded-md`}
                  >
                    <small className="text-xs text-slate-500">
                      {msg.senderEmail || "unknown@email.com"}
                    </small>
                    {msg.sender?._id === "ai" ? (
                      <Markdown
                        options={{
                          overrides: {
                            code: {
                              component: ({ className, children }) => {
                                const language =
                                  className?.replace("lang-", "") ||
                                  "plaintext";
                                return (
                                  <SyntaxHighlighter
                                    language={language}
                                    style={oneDark} // VS Code-like theme
                                    customStyle={{
                                      padding: "1rem",
                                      borderRadius: "8px",
                                      fontSize: "0.85rem",
                                      backgroundColor: "#1e1e1e",
                                    }}
                                  >
                                    {children}
                                  </SyntaxHighlighter>
                                );
                              },
                            },
                          },
                        }}
                      >
                        {msg.message}
                      </Markdown>
                    ) : (
                      <p className="text-sm">{msg.message}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="inputField w-full flex absolute bottom-0 p-3 bg-white border-t">
              <div className="flex flex-grow border border-gray-300 rounded-md overflow-hidden">
                <input
                  type="text"
                  placeholder="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-grow px-4 py-2 text-sm outline-none bg-white"
                />
                <button
                  className="w-12 h-11 bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition"
                  onClick={send}
                >
                  <i className="ri-send-plane-2-fill text-white text-lg"></i>
                </button>
              </div>
            </div>
          </div>

          <div
            className={`sidepanel w-100 h-full bg-slate-50 absolute top-0 transition-all duration-300 ${
              isSidePanelOpen ? "-translate-x-0" : "-translate-x-full"
            } flex flex-col gap-2`}
          >
            <header className="flex justify-end p-4 px-3 bg-slate-200">
              <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
                <i className="ri-close-line"></i>
              </button>
            </header>

            <div className="users flex flex-col gap-2 p-2">
              {projectFetch.users &&
                projectFetch.users.map((user) => (
                  <div
                    key={user._id}
                    className="user flex gap-3 items-center p-2 hover:bg-slate-100 rounded-md"
                  >
                    <div className="userimage flex items-center justify-center aspect-square w-12 rounded-full bg-slate-200">
                      <i className="ri-user-line text-xl text-slate-700"></i>
                    </div>
                    <h1 className="font-semibold text-lg text-slate-800">
                      {user.email}
                    </h1>
                  </div>
                ))}
            </div>
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 max-h-[80vh] overflow-y-auto relative">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    Select Collaborators
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-2xl text-gray-500 hover:text-gray-700"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="flex flex-col gap-3 mb-6 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-100">
                  {projects.length > 0 &&
                    projects[0].users.map((user) => {
                      const isSelected = selectedUserIds.includes(user._id);
                      return (
                        <div
                          key={user._id}
                          onClick={() => toggleUserSelect(user)}
                          className={`flex items-center gap-4 cursor-pointer select-none p-3 rounded-md ${
                            isSelected
                              ? "bg-blue-100 border border-blue-500"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <div className="userimage flex items-center justify-center aspect-square w-12 rounded-full bg-slate-50">
                            <i className="ri-user-line text-xl text-slate-700"></i>
                          </div>
                          <span className="font-medium text-gray-900">
                            {user.email}
                          </span>
                        </div>
                      );
                    })}
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleAddCollaborators}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    Add Collaborators
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default Project;
