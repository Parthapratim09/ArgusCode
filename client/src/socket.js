import { io } from "socket.io-client";
const URL = import.meta.env.VITE_BACK_END_URL;
const socket = io(URL, { autoConnect: true });
export default socket;
