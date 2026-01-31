import { TwitterIcon } from "../../icons/TwitterIcon";
import { YoutubeIcon } from "../../icons/YoutubeIcon";
import { Document } from "../../icons/Document";
import { SidebarItem } from "./SidebarItem";
import { LinkIcon } from "../../icons/LinkIcon";
import ChatIcon from "../../icons/ChatIcon";
import { useNavigate } from "react-router-dom";
import SidebarIcon from "../../icons/SidebarIcon";
import { motion } from "framer-motion";
import BrainIcon from "../../icons/BrainIcon";

interface SidebarProps {
  selectedType: "twitter" | "youtube" | "document" | "links" | "chat";
  onSelectType: (type: "twitter" | "youtube" | "document" | "links" | "chat") => void;
  user?: {
    username: String;
    email: String;
  };
  sidebaropen: boolean;
  setSidebaropen: (open: boolean) => void;
}

export function Sidebar({
  selectedType,
  onSelectType,
  user,
  sidebaropen,
  setSidebaropen,
}: SidebarProps) {
  const navigate = useNavigate();
  const toggleSidebar = () => setSidebaropen(!sidebaropen);

  return (
    <div className="">
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 z-50 rounded-full bg-white p-2 shadow-md transition-all duration-300 hover:bg-gray-100 ${
          sidebaropen ? "left-[15rem]" : "left-2"
        }`}
      >
        <SidebarIcon />
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebaropen ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="fixed dashboard-grid  left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-gray-200 bg-gradient-to-b from-white to-gray-50 px-4"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 pt-6 pl-2">
          <BrainIcon height={30} width={30}/>
          <h1 className="text-lg font-semibold  tracking-tight text-gray-900">
            SecondBrain
          </h1>
        </div>


        <nav className="mt-8 flex flex-1 flex-col gap-2">
          <SidebarItem
            text="YouTube"
            icon={<YoutubeIcon />}
            selected={selectedType === "youtube"}
            onClick={() => onSelectType("youtube")}
          />
          <SidebarItem
            text="Twitter"
            icon={<TwitterIcon />}
            selected={selectedType === "twitter"}
            onClick={() => onSelectType("twitter")}
          />
          <SidebarItem
            text="Links"
            icon={<LinkIcon />}
            selected={selectedType === "links"}
            onClick={() => onSelectType("links")}
          />
          <SidebarItem
            text="Documents"
            icon={<Document />}
            selected={selectedType === "document"}
            onClick={() => onSelectType("document")}
          />
          <SidebarItem
            text="Chat with Anything"
            icon={<ChatIcon />}
            selected={selectedType === "chat"}
            onClick={() => onSelectType("chat")}
          />
        </nav>

         {/* User Card  */}
        {user && (
          <div className="mb-4 rounded-2xl bg-white p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
                {user.username[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {user.username}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/signin");
              }}
              className="mt-3 w-full rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        )}
      </motion.aside>
    </div>
  );
}
