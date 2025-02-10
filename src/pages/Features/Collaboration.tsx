import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  ArrowLeft,
  Send,
  Plus,
  FileUp,
  Users,
  Loader2,
  File
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { ChatRoom, ChatMessage, SharedFile } from '../../lib/types';

function ChatMessageItem({ message, currentUserId }: { message: ChatMessage; currentUserId: string | undefined }) {
  const isOwnMessage = currentUserId === message.user_id;
  
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'bg-indigo-600' : 'bg-gray-700'} rounded-lg p-3`}>
        <p className="text-white">{message.content}</p>
        <span className="text-xs text-gray-300 mt-1">
          {new Date(message.created_at).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

function SharedFileItem({ file }: { file: SharedFile }) {
  return (
    <a 
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
    >
      <File className="w-5 h-5 text-indigo-400 mr-3" />
      <div className="flex-1">
        <h4 className="text-white font-medium">{file.name}</h4>
        {file.description && (
          <p className="text-sm text-gray-400">{file.description}</p>
        )}
      </div>
      <span className="text-xs text-gray-400">
        {new Date(file.created_at).toLocaleDateString()}
      </span>
    </a>
  );
}

function CreateRoomModal({ 
  isOpen, 
  onClose,
  onCreateRoom 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onCreateRoom: (name: string, description: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreateRoom(name, description);
      onClose();
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-xl p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Create Chat Room</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Room Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Create Room'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function Collaboration() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get current user ID on component mount
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    getCurrentUser();
    
    fetchRooms();
    
    // Subscribe to new messages
    const subscription = supabase
      .channel('chat_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages' 
      }, payload => {
        const newMessage = payload.new as ChatMessage;
        if (selectedRoom && newMessage.room_id === selectedRoom.id) {
          setMessages(prev => [...prev, newMessage]);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedRoom]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages();
      fetchFiles();
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setRooms(data || []);
      if (data && data.length > 0 && !selectedRoom) {
        setSelectedRoom(data[0]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedRoom) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', selectedRoom.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchFiles = async () => {
    if (!selectedRoom) return;
    
    try {
      const { data, error } = await supabase
        .from('shared_files')
        .select('*')
        .eq('room_id', selectedRoom.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleCreateRoom = async (name: string, description: string) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('chat_rooms')
      .insert([{
        name,
        description,
        created_by: userData.user.id
      }]);

    if (error) throw error;
    fetchRooms();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          room_id: selectedRoom.id,
          user_id: userData.user.id,
          content: newMessage.trim()
        }]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedRoom) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    try {
      // In a real app, you would upload the file to a storage service
      // and get a URL. For this demo, we'll create a fake URL
      const fakeUrl = `https://example.com/files/${file.name}`;

      const { error } = await supabase
        .from('shared_files')
        .insert([{
          room_id: selectedRoom.id,
          name: file.name,
          description: '',
          url: fakeUrl,
          size_bytes: file.size,
          mime_type: file.type,
          user_id: userData.user.id
        }]);

      if (error) throw error;
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Link 
        to="/" 
        className="inline-flex items-center text-gray-300 hover:text-white mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>
      
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-indigo-600/20 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
              <MessageSquare className="text-indigo-400 w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-white">Real-Time Collaboration</h1>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Room
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Chat rooms list */}
          <div className="col-span-3 bg-gray-900/50 backdrop-blur-lg rounded-xl p-4">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-indigo-400 mr-2" />
              <h2 className="text-lg font-semibold text-white">Chat Rooms</h2>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {rooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedRoom?.id === room.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <h3 className="font-medium">{room.name}</h3>
                    {room.description && (
                      <p className="text-sm opacity-80 truncate">{room.description}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat messages */}
          <div className="col-span-6 bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 flex flex-col">
            {selectedRoom ? (
              <>
                <div className="flex-1 overflow-y-auto mb-4">
                  {messages.map(message => (
                    <ChatMessageItem
                      key={message.id}
                      message={message}
                      currentUserId={currentUserId}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a room to start chatting
              </div>
            )}
          </div>

          {/* Shared files */}
          <div className="col-span-3 bg-gray-900/50 backdrop-blur-lg rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <File className="w-5 h-5 text-indigo-400 mr-2" />
                <h2 className="text-lg font-semibold text-white">Shared Files</h2>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!selectedRoom}
                className="text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileUp className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {files.map(file => (
                <SharedFileItem key={file.id} file={file} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
}

export default Collaboration;

export { Collaboration }