import { useEffect, useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../component/UI/Button';
import { PlusIcon } from '../icons/PlusIcon';
import { ShareIcon } from '../icons/ShareIcon';
import { Card } from '../component/UI/Card';
import { CreateContentModel } from '../component/UI/CreateContentModel';
import { Sidebar } from '../component/UI/Sidebar';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import Microlink from '@microlink/react';
import DraggableChatBot from './Draggable';
import BotButton from './BotButton';
import ChatWindow from './ChatWindow';
import { MyContext } from './Context';
import { v1 as uuidv1 } from 'uuid';
import ChatNavbar from './ChatNavbar';

import './Dashboard.css';

const raw = localStorage.getItem('user');
const user = raw ? JSON.parse(raw) : undefined;

export function Dashboard() {
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Content | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  interface Content {
    _id: string;
    title: string;
    link: string;
    type: 'youtube' | 'twitter' | 'document' | 'links';
  }
  type Chat = {
    role: string;
    content: string;
  };
  interface Thread {
    threadId: string;
    title: string;
  }

  const [contents, setContents] = useState<Content[]>([]);
  const [selectedType, setSelectedType] = useState<'twitter' | 'youtube' | 'document' | 'links' | 'chat'>('youtube');
  const [isChatOpen, setisChatOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebaropen, setSidebaropen] = useState(false);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/content`, {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });
      setContents(res.data.content);
    } catch (err) {
      console.error('Failed to fetch contents', err);
    }
  };

  const handleDelete = async (contentId: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/content/${contentId}`, {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });
      setContents((prev) => prev.filter((item) => item._id !== contentId));
    } catch (err) {
      console.error('Failed to delete content', err);
      alert('Error deleting content');
    }
  };

  useEffect(() => {
    if (selectedCard?.type === 'twitter' && (window as any).twttr) {
      (window as any).twttr.widgets.load();
    }
  }, [selectedCard]);

  const filteredContents = contents
    .filter((content) => content.type === selectedType)
    .filter((content) =>
      searchQuery
        ? content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          content.link.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const cardsPerPage = sidebaropen ? 3 : 4;
  const totalPages = Math.ceil(filteredContents.length / cardsPerPage);
  const paginatedContents = filteredContents.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState('');
  const [currThreadId, setcurrThreadId] = useState<string>(uuidv1());
  const [prevChats, setprevChats] = useState<Chat[]>([]);
  const [newChat, setnewChat] = useState(true);
  const [allThreads, setAllThreads] = useState<Thread[]>([]);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');


  const providerValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setcurrThreadId,
    newChat,
    setnewChat,
    prevChats,
    setprevChats,
    allThreads,
    setAllThreads,
  };

  return (
    <div>
      <div className="fixed top-0 left-0 h-screen w-10 bg-gray-100 z-0"></div>
      <Sidebar
        selectedType={selectedType}
        onSelectType={setSelectedType}
        user={user}
        sidebaropen={sidebaropen}
        setSidebaropen={setSidebaropen}
      />

      <div
        className={`min-h-screen dashboard-grid transition-all duration-300
    ${sidebaropen ? 'ml-72' : 'ml-10 '}`}
      >
        <MyContext.Provider value={providerValues}>
          {selectedType === 'chat' && (
            <>
              <ChatNavbar />
              <ChatWindow />
            </>
          )}
        </MyContext.Provider>

        <CreateContentModel
          open={modelOpen}
          onClose={() => {
            setModelOpen(false);
            fetchContents();
          }}
        />

        {selectedType !== 'chat' && (
          <div className="relative flex items-center py-4">
            <div className="ml-auto flex pl-2 gap-4 z-20 relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by title or link..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                 className={`${sidebaropen ? "min-w-2xl" : "min-w-3xl"} pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all shadow-sm hover:shadow-md`}/>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              
              {searchQuery && (
                <p className="mt-3 text-sm text-gray-600">
                  Found {filteredContents.length} result{filteredContents.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="ml-auto flex pl-2 gap-4">
              <Button
                onClick={() => setModelOpen(true)}
                startIcon={<PlusIcon size="lg" />}
                variant="primary"
                text="Add content"
                size="md"
              />

              <Button
                onClick={async () => {
                  try {
                    const response = await axios.post(
                      `${BACKEND_URL}/api/v1/brain/share`,
                      { share: true },
                      {
                        headers: {
                          Authorization: localStorage.getItem('token'),
                        },
                      }
                    );
                    const url = `http://localhost:5173/share/${response.data.hash}`;
                    alert(url);
                  } catch (error: any) {
                    console.error('Failed to share brain:', error);
                    alert('Could not generate shareable link. Please try again.');
                  }
                }}
                startIcon={<ShareIcon size="lg" />}
                variant="secondary"
                text="Share Brain"
                size="md"
              />
            </div>
          </div>
        )}

        {selectedType !== 'chat' && (
          <div className="flex flex-col gap-8">
            <div
  key={currentPage}
  className={`
    transition-all duration-300 ease-out
    ${direction === 'next'
      ? 'animate-slide-left'
      : 'animate-slide-right'}
  `}
>
  <div className={`flex flex-wrap ${sidebaropen ? "px-8 gap-10" : "gap-2"}`}>
          {filteredContents.length > 0 ? (
            paginatedContents.map(({ type, link, title, _id }) => (
              <Card
                key={_id}
                type={type}
                link={link}
                title={title}
                contentId={_id}
                onDelete={() => handleDelete(_id)}
                onClick={() => setSelectedCard({ _id, title, link, type })}
              />
            ))
          ) : searchQuery ? (
          <div className="w-full text-center py-16">
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No results found</h3>
          </div>
        ) : null}
      </div>
    </div>


            {filteredContents.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pb-8">
                    <button
                        onClick={() => {
                          setDirection('prev');
                          setCurrentPage(prev => Math.max(1, prev - 1));
                        }}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>


                <span className="text-sm font-medium text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => {
                    setDirection('next');
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  }}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>

              </div>
            )}
          </div>
        )}

        {selectedType !== 'chat' && (
          <>
            {isChatOpen && <DraggableChatBot onClose={() => setisChatOpen(false)} />}
            {!isChatOpen && <BotButton onClick={() => setisChatOpen(true)} />}
          </>
        )}

        {selectedCard && (
          <div className="fixed inset-0 backdrop-blur-sm bg-transparent  flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-3xl w-full h-[80vh] overflow-y-auto relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl cursor-pointer"
                onClick={() => setSelectedCard(null)}
              >
                ×
              </button>
              <h2 className="text-xl flex justify-center font-semibold mb-4">{selectedCard.title}</h2>

              {selectedCard.type === 'youtube' && (
                <iframe
                  className="w-full h-[470px] rounded-md pl-5 pr-5"
                  src={selectedCard.link.replace('watch', 'embed').replace('?v=', '/')}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              )}

              {selectedCard.type === 'twitter' && (
                <div className="flex justify-center">
                  <blockquote className="twitter-tweet w-full">
                    <a href={selectedCard.link.replace('x.com', 'twitter.com')}></a>
                  </blockquote>
                </div>
              )}

              {selectedCard.type === 'document' && (
                <p className="whitespace-pre-line text-gray-800 mt-2">{selectedCard.link}</p>
              )}

              {selectedCard.type === 'links' && (
                <div className="w-full h-[470px]">
                  <div className="w-full h-full block">
                    <Microlink url={selectedCard.link} size="large" style={{ height: '100%', maxWidth: '100%' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
