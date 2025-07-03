import React, { useState, useEffect } from "react";
import axios from "../config/axios.js";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/all")
      .then((res) => {
        console.log(res.data);
        setProject(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  function createProject(e) {
    e.preventDefault();
    console.log("Creating project:", projectName);
    axios
      .post("/create", {
        name: projectName,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    setProjectName("");
    setIsModelOpen(false);
  }

  return (
    <>
      <main className="p-4">
        <div className="projects flex flex-wrap gap-3">
          <button
            className="project p-4 border border-slate-300 rounded-md ml-2"
            onClick={() => setIsModelOpen(true)}
          >
            <i className="ri-link "></i>New Project
          </button>
          {project.map((project) => (
            <div
              key={project._id}
              onClick={() => {
                navigate(`/project`, {
                  state: { project },
                });
              }}
              className="project flex flex-col gap-2 cursor-pointer p-4 border border-slate-300 rounded-md min-w-52 hover:bg-slate-200"
            >
              <h2 className="font-semibold">{project.name}</h2>

              <div className="flex gap-2">
                <p>
                  {" "}
                  <small>
                    {" "}
                    <i className="ri-user-line"></i> Collaborators
                  </small>{" "}
                  :
                </p>
                {project.users.length}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {isModelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Create Project</h2>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label
                  htmlFor="projectName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project Name
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModelOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
