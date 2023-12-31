// ******************** //
// The createDM account event file.
// ******************** //

import { StringSchema } from '@ezier/validate';
import { profileIdSchema } from 'events/shared';
import {
    CreateDMResult,
    CreateDMServerParams,
} from 'interfaces/account/createDM';
import { EventTemplate, FronvoError } from 'interfaces/all';
import { generateError, getAccountSocketId } from 'utilities/global';
import { v4 } from 'uuid';
import { prismaClient } from 'variables/global';

async function createDM({
    io,
    socket,
    account,
    profileId,
}: CreateDMServerParams): Promise<CreateDMResult | FronvoError> {
    const targetAccount = await prismaClient.account.findFirst({
        where: {
            profileId,
        },
    });

    if (!targetAccount) {
        return generateError('ACCOUNT_404');
    }

    // Must be friends
    if (!targetAccount.friends.includes(account.profileId)) {
        return generateError('NOT_FRIEND');
    }

    const room = await prismaClient.dm.findFirst({
        where: {
            AND: [
                {
                    dmUsers: {
                        has: profileId,
                    },
                },
                {
                    dmUsers: {
                        has: account.profileId,
                    },
                },
            ],
        },
    });

    if (room) {
        if (room.dmHiddenFor?.includes(account.profileId)) {
            const newDmHiddenFor = room.dmHiddenFor;
            newDmHiddenFor.splice(newDmHiddenFor.indexOf(account.profileId), 1);

            try {
                await prismaClient.dm.update({
                    where: {
                        roomId: room.roomId,
                    },

                    data: {
                        dmHiddenFor: {
                            set: newDmHiddenFor,
                        },
                    },
                });
            } catch (e) {
                return generateError('UNKNOWN');
            }

            // Notify sockets about the new dm
            io.to(socket.id).emit('roomCreated', {
                roomId: room.roomId,
            });

            return { roomId: room.roomId };
        } else {
            return generateError('DM_EXISTS');
        }
    }

    const roomId = v4();

    try {
        await prismaClient.dm.create({
            data: {
                roomId,
                dmUsers: {
                    set: [profileId, account.profileId],
                },
            },
        });
    } catch (e) {
        return generateError('UNKNOWN');
    }

    // Notify both sockets about the new dm
    io.to(socket.id).emit('roomCreated', {
        roomId,
    });

    io.sockets.sockets.get(getAccountSocketId(profileId))?.emit('roomCreated', {
        roomId,
    });

    // Put target accounts to the dm's room
    io.sockets.sockets.get(socket.id).join(roomId);

    io.sockets.sockets.get(getAccountSocketId(profileId))?.join(roomId);

    return { roomId };
}

const createDMTemplate: EventTemplate = {
    func: createDM,
    template: ['profileId'],
    schema: new StringSchema({
        ...profileIdSchema,
    }),
};

export default createDMTemplate;
