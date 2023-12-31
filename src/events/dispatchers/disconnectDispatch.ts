// ******************** //
// The disconnect dispatcher file which handles disconnections.
// ******************** //

import { ClientToServerEvents } from 'interfaces/events/c2s';
import { ServerToClientEvents } from 'interfaces/events/s2c';
import { Server, Socket } from 'socket.io';
import utilities from 'utilities/all';

export default async function disconnectDispatch(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    socket: Socket<ServerToClientEvents, ClientToServerEvents>,
    reason: string
): Promise<void> {
    // Logout if logged in
    if (utilities.isSocketLoggedIn(socket)) {
        utilities.logoutSocket(io, socket);
    }
}
