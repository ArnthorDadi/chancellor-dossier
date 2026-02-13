import { useLocation } from "react-router-dom";

export function useCurrentPage() {
  const location = useLocation();
  const pathname = location.pathname;

  // Determine current page type based on path
  if (pathname.startsWith("/room/") && !pathname.includes("/game")) {
    return { isRoomLobby: true, isGameRoom: false, isLanding: false };
  }

  if (pathname.startsWith("/room/") && pathname.includes("/game")) {
    return { isRoomLobby: false, isGameRoom: true, isLanding: false };
  }

  if (pathname === "/") {
    return { isRoomLobby: false, isGameRoom: false, isLanding: true };
  }

  return { isRoomLobby: false, isGameRoom: false, isLanding: false };
}
