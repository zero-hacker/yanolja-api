type Event = {
    venue: {
        id: string;
        name: string;
        operationHours: string;
        location: {
            address: string;
            geo: {
                latitude: string;
                longitude: string;
            };
        };
        contact: {
            phone: string;
            email: string;
        };
        facilities: {
            parking: string;
            accessibility: string;
            foodAndBeverage: string;
            restrooms: string;
        };
    };
    events: Array<{
        type: string;
        name: string;
        dateTime: string;
        ageRestriction: string;
        ticketInfo: {
            price: string;
            availability: string;
            purchaseLink: string;
        };
        entryRequirements: {
            idRequired: boolean;
            mobileEntry: boolean;
            printAtHome: boolean;
        };
    }>;
    refundPolicy: {
        timeLimit: string;
        conditions: string;
    };
    organizer: {
        name: string;
        contact: {
            phone: string;
            email: string;
        };
    };
};

//이벤트 등록 (예시)
app.post('/events', async (req: Request, res: Response) => {
    const event: Event = req.body;
  
    try {
        const venueResult = await pool.query(
        'INSERT INTO venues(name, address, latitude, longitude, phone, email, operationHours) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [
            event.venue.name,
            event.venue.location.address,
            event.venue.location.geo.latitude,
            event.venue.location.geo.longitude,
            event.venue.contact.phone,
            event.venue.contact.email,
            event.venue.operationHours
        ]);
  
        const venueId = venueResult.rows[0].id;
        res.status(201).send({ success: true, message: "이벤트 등록 성공", venueId: venueId });

    } catch (err) {
      console.error(err);
      res.status(500).send('서버 오류');
    }
});

//이벤트 ID로 조회 (예시)
app.get('/events/:id', async (req: Request, res: Response) => {
    const eventId = req.params.id;

    try {
        const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);

        if (eventResult.rows.length === 0) {
            return res.status(404).send('이벤트 정보가 없습니다.');
        }

        const event = eventResult.rows[0];
        const venueResult = await pool.query(
            'SELECT * FROM venues WHERE id = $1',
            [event.venueId]
        );

        const venue = venueResult.rows[0];

        res.status(200).send({ event, venue });

    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');
    }
});

//이벤트 ID로 수정 (예시)
app.put('/events/:id', async (req: Request, res: Response) => {
    const eventId = req.params.id;
    const updatedEvent: Event = req.body;
  
    try {
        await pool.query(
            'UPDATE venues SET name = $1, address = $2, latitude = $3, longitude = $4, phone = $5, email = $6, operationHours = $7 WHERE id = $8',
            [updatedEvent.venue.name,
            updatedEvent.venue.location.address,
            updatedEvent.venue.location.geo.latitude,
            updatedEvent.venue.location.geo.longitude,
            updatedEvent.venue.contact.phone,
            updatedEvent.venue.contact.email,
            updatedEvent.venue.operationHours,
            updatedEvent.venue.id]
        );
  
        res.status(200).send({ success: true, message: "이벤트 수정 성공" });

    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');
    }
});

//이벤트 ID로 삭제 (예시)
app.delete('/events/:id', async (req: Request, res: Response) => {
    const eventId = req.params.id;
  
    try {
        await pool.query('DELETE FROM events WHERE id = $1', [eventId]);
        res.status(200).send({ success: true, message: "이벤트 삭제 성공" });

    } catch (err) {
      console.error(err);
      res.status(500).send('서버 오류');
    }
});

//이벤트 전체 조회 (예시)
app.get('/events', async (req: Request, res: Response) => {
    try {
        const eventsResult = await pool.query('SELECT * FROM events');
        const events = eventsResult.rows;
  
        for (const event of events) {
            const venueResult = await pool.query(
            'SELECT * FROM venues WHERE id = $1',[event.venue.id]
        );
  
        event.venue = venueResult.rows[0];
    }
  
    res.status(200).send(events);

    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류');
    }
});