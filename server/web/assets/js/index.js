const {
    SkyWayAuthToken,
    SkyWayContext,
    SkyWayMediaDevices,
    SkyWayRoom,
    uuidV4,
} = skyway_room;

(async () => {
    // 1
    const myVideo = document.getElementById("my-video");

    const {
        audio,
        video,
    } = await SkyWayMediaDevices.createMicrophoneAudioAndCameraStream(); // 2

    video.attach(myVideo); // 3
    await myVideo.play(); // 4

    // Token作成
    // ! ここは本来サーバーアプリケーションで実行したい
    const token = new SkyWayAuthToken({
        jti: uuidV4(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 600,
        scope: {
            app: {
                // APIキー
                id: "90e3fbe1-8fe4-4743-a5bd-4a5425dd4175",
                turn: true,
                actions: ["read"],
                channels: [
                    {
                        id: "*",
                        name: "*",
                        actions: ["write"],
                        members: [
                            {
                                id: "*",
                                name: "*",
                                actions: ["write"],
                                publication: {
                                    actions: ["write"],
                                },
                                subscription: {
                                    actions: ["write"],
                                },
                            },
                        ],
                        sfuBots: [
                            {
                                actions: ["write"],
                                forwardings: [
                                    {
                                        actions: ["write"]
                                    }
                                ]
                            }
                        ]
                    },
                ],
            },
        },
    });
    const tokenString = token.encode(
        // シークレットキー
        "6AXlc0Qc8OCQieTMLNla9sOJXaoZJBsyQQXeNHWgOBo="
    );

    const buttonArea = document.getElementById("button-area");
    const theirMediaArea = document.getElementById("their-media-area");
    const roomNameInput = document.getElementById("room-name");
    const myId = document.getElementById("my-id");


    // 参加ボタン用イベントハンドラ
    document.getElementById("join").onclick = async () => {
        if (roomNameInput.value === "") return;

        const context = await SkyWayContext.Create(tokenString);
        // p2pルームを参照or作成する
        const room = await SkyWayRoom.FindOrCreate(context, {
            type: "p2p",
            name: roomNameInput.value,
        });
        // roomが返す自分のidを取得、格納する
        const me = await room.join();
        myId.textContent = me.id;

        // 自分の映像と音声を送信する
        await me.publish(audio);
        await me.publish(video);

        // 相手の映像と音声を受信する
        function subscribeAndAttach(publication) {
            // 3
            if (publication.publisher.id === me.id) return;

            const subscribeButton = document.createElement("button"); // 3-1
            subscribeButton.className = `btn btn-primary`
            subscribeButton.textContent = `${publication.publisher.id}: ${publication.contentType}`;

            buttonArea.appendChild(subscribeButton);

            subscribeButton.onclick = async () => {
                // 3-2
                const { stream } = await me.subscribe(publication.id); // 3-2-1

                let newMedia; // 3-2-2
                switch (stream.track.kind) {
                    case "video":
                        newMedia = document.createElement("video");
                        newMedia.playsInline = true;
                        newMedia.autoplay = true;
                        newMedia.className = "col-12";
                        break;
                    case "audio":
                        newMedia = document.createElement("audio");
                        newMedia.controls = true;
                        newMedia.autoplay = true;
                        break;
                    default:
                        return;
                }

                stream.attach(newMedia); // 3-2-3

                theirMediaArea.appendChild(newMedia);
            };
        }

        room.publications.forEach(subscribeAndAttach); // 1

        room.onStreamPublished.add((e) => {
            // 2
            subscribeAndAttach(e.publication, me);
        });
    };


})(); // 1