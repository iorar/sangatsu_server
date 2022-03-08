import { SkyWayAuthToken } from '@skyway-sdk/token';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
// import keys from './data/keys.json'

const app: express.Express = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.listen(80, () => {
    console.log("Start on port 80.")
})

export default function skyway_auth(req: express.Request, res: express.Response, next: express.NextFunction) {
    const roomName = req.query.roomName as string | undefined;
    const memberName = req.query.memberName as string | undefined;

    // const ps = PropertiesService.getScriptProperties();
    // const appId = keys.SKYWAY_APP_ID;
    // const secretKey = keys.SKYWAY_SECRET_KEY;
    const appId = "90e3fbe1-8fe4-4743-a5bd-4a5425dd4175";
    const secretKey = "6AXlc0Qc8OCQieTMLNla9sOJXaoZJBsyQQXeNHWgOBo=";

    if (appId === null || secretKey === null || appId === undefined || secretKey === undefined) {
        res.send(JSON.stringify({ error: 'appId or secretKey is empty.' }));
    }
    const token = new SkyWayAuthToken({
        jti: uuidv4(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 600,
        scope: {
            app: {
                id: appId,
                turn: true,
                actions: ['read'],
                channels: [
                    {
                        id: '*',
                        name: roomName,
                        actions: ['write'],
                        members: [
                            {
                                id: '*',
                                name: memberName,
                                actions: ['write'],
                                publication: {
                                    actions: ['write'],
                                },
                                subscription: {
                                    actions: ['write'],
                                },
                            },
                        ],
                        sfuBots: [
                            {
                                actions: ['write'],
                                forwardings: [
                                    {
                                        actions: ['write']
                                    }
                                ]
                            }
                        ]
                    },
                ],
            },
        },
    });
    const tokenString = token.encode(secretKey);

    const obj = {
        token: tokenString
    };
    res.send(JSON.stringify(obj));
}

app.get('/', skyway_auth);