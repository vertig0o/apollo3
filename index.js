const { createServer, createPubSub } = require("@graphql-yoga/node");

const { v4: uuidv4 } = require("uuid");
const { events, users, participants, locations } = require("./data.json");

const typeDefs = `
    type User {
        id: ID!
        username: String!
        email: String!
    }

    input CreatedUserInput {
        username: String!
        email: String!
    }

    input UpdateUserInput {
        username: String
        email: String
    }

    type Event {
        id: ID!
        title: String!
        desc: String!
        date: String!
        from: String!
        to: String!
        location_id: Int!
        user_id: ID!
    }

    input CreatedEventInput {
        title: String!
        desc: String!
        date: String!
        from: String!
        to: String!
        location_id: Int!
        user_id: ID!
    }

    input UpdatedEventInput {
        title: String
        desc: String
        date: String
        from: String
        to: String
        location_id: Int
        user_id: ID
    }

    type Location {
        id: ID!
        name: String!
        desc: String!
        lat: Float!
        lng: Float!
    }

    input CreatedLocationInput {
        name: String!
        desc: String!
        lat: Float!
        lng: Float!
    }

    input UpdatedLocationInput {
        name: String
        desc: String
        lat: Float
        lng: Float
    }

    type Participant {
        id: ID!
        user_id: ID!
        event_id: ID!
    }

    input CreatedParticipantInput {
        user_id: ID!
        event_id: ID!
    }

    input UpdatedParticipantInput {
        user_id: ID
        event_id: ID
    }

    type DeleteAllOutput {
        count: Int!
    }

    type Query {
        # USER
        users: [User!]!
        user(id: ID!): User!

        # EVENT
        events: [Event!]!
        event(id: ID!): Event!

        # LOCATİON
        locations: [Location!]!
        location(id: ID!): Location!

        # PARTİCİPANT
        participants: [Participant!]!
        participant(id: ID!): Participant!
    }

    type Mutation {
        # USER
        createdUser(data: CreatedUserInput!): User!
        updateUser(id: ID!, data: UpdateUserInput!): User!
        deletedUser(id: ID!): User!
        deletedAllUser: DeleteAllOutput!

        # EVENT
        createdEvent(data: CreatedEventInput!): Event!
        updatedEvent(id: ID!, data: UpdatedEventInput!): Event!
        deletedEvent(id: ID!): Event!
        deletedAllEvent: DeleteAllOutput!

        # LOCATİON
        createdLocation(data: CreatedLocationInput!): Location!
        updatedLocation(id: ID!, data: UpdatedLocationInput!): Location!
        deletedLocation(id: ID!): Location!
        deletedAllLocation: DeleteAllOutput!

        # PARTİCİPANT
        createdParticipant(data: CreatedParticipantInput!): Participant!
        updatedParticipant(id: ID!, data: UpdatedParticipantInput!): Participant!
        deletedParticipant(id: ID!): Participant!
        deletedAllParticipant: DeleteAllOutput!
    }

    type Subscription {
        # USER
        userCreated: User!
        userUpdated: User!
        userDeleted: User!

        # EVENT
        eventCreated: Event!
        eventUpdated: Event!
        eventDeleted: Event!

        # LOCATİON
        locationCreated: Location!
        locationUpdated: Location!
        locationDeleted: Location!

        # PARTİCİPANT
        participantAdded: Participant!
        participantUpdated: Participant!
        participantDeleted: Participant!
    }
`;

const resolvers = {
  Subscription: {
    userCreated: {
      subscribe: (_, __, { pubsub }) => pubsub.subscribe("userCreated"),
      resolve: (payload) => payload,
    },
    eventCreated: {
      subscribe: (_, __, { pubsub }) => pubsub.subscribe("eventCreated"),
      resolve: (payload) => payload,
    },
    participantAdded: {
      subscribe: (_, __, { pubsub }) => pubsub.subscribe("participantAdded"),
      resolve: (payload) => payload,
    },
  },
  Mutation: {
    // USER
    createdUser: (_, { data }, { pubsub }) => {
      const newUser = { id: uuidv4(), ...data };
      users.push(newUser);
      pubsub.publish("userCreated", newUser);
      return newUser;
    },
    updateUser: (_, { id, data }) => {
      const userIndex = users.findIndex((user) => user.id === parseInt(id));
      if (userIndex === -1) {
        throw new Error("User not found.");
      }
      const updateUser = (users[userIndex] = {
        ...users[userIndex],
        ...data,
      });
      return updateUser;
    },
    deletedUser: (_, { id }) => {
      const userIndex = users.findIndex((user) => user.id === parseInt(id));
      if (userIndex === -1) {
        throw new Error("User not found.");
      }
      const deletedUser = users[userIndex];
      users.splice(userIndex, 1);
      return deletedUser;
    },
    deletedAllUser: () => {
      const userLength = users.length;
      users.splice(0, userLength);
      return {
        count: userLength,
      };
    },

    // EVENT
    createdEvent: (_, { data }, { pubsub }) => {
      const newEvent = { id: uuidv4(), ...data };
      events.push(newEvent);
      pubsub.publish("eventCreated", newEvent);
      return newEvent;
    },
    updatedEvent: (_, { id, data }) => {
      const eventIndex = events.findIndex((event) => event.id === parseInt(id));
      if (eventIndex === -1) {
        throw new Error("Event not found.");
      }
      const updateEvent = (events[eventIndex] = {
        ...events[eventIndex],
        ...data,
      });
      return updateEvent;
    },
    deletedEvent: (_, { id }) => {
      const eventIndex = events.findIndex((event) => event.id === parseInt(id));
      if (eventIndex === -1) {
        throw new Error("Event not found.");
      }
      const deletedEvent = events[eventIndex];
      events.splice(eventIndex, 1);
      return deletedEvent;
    },
    deletedAllEvent: () => {
      const eventLength = events.length;
      events.splice(0, eventLength);
      return {
        count: eventLength,
      };
    },

    // LOCATİON
    createdLocation: (_, { data }) => {
      const newLocation = { id: uuidv4(), ...data };
      locations.push(newLocation);
      return newLocation;
    },
    updatedLocation: (_, { id, data }) => {
      const locationIndex = locations.findIndex(
        (location) => location.id === parseInt(id)
      );

      if (locationIndex === -1) {
        throw new Error("Location not found.");
      }

      const updateLocation = (locations[locationIndex] = {
        ...locations[locationIndex],
        ...data,
      });

      return updateLocation;
    },
    deletedLocation: (_, { id }) => {
      const locationIndex = locations.findIndex(
        (location) => location.id === parseInt(id)
      );

      if (locationIndex === -1) {
        throw new Error("Location not found");
      }

      const deletedLocation = locations[locationIndex];
      locations.splice(locationIndex, 1);

      return deletedLocation;
    },
    deletedAllLocation: () => {
      const locationLength = locations.length;
      locations.splice(0, locationLength);
      return {
        count: locationLength,
      };
    },

    // PARTİCİPANT
    createdParticipant: (_, { data }, { pubsub }) => {
      const newParticipant = { id: uuidv4(), ...data };
      participants.push(newParticipant);
      pubsub.publish("participantAdded", newParticipant);
      return newParticipant;
    },
    updatedParticipant: (_, { id, data }) => {
      const participantIndex = participants.findIndex(
        (participant) => participant.id === parseInt(id)
      );
      if (participantIndex === -1) {
        throw new Error("Participant not found.");
      }
      const updateParticipant = (participants[participantIndex] = {
        ...participants[participantIndex],
        ...data,
      });
      return updateParticipant;
    },
    deletedParticipant: (_, { id }) => {
      const participantIndex = participants.findIndex(
        (participant) => participant.id === parseInt(id)
      );
      if (participantIndex === -1) {
        throw new Error("Participant not found.");
      }
      const deletedParticipant = participants[participantIndex];
      participants.splice(participantIndex, 1);
      return deletedParticipant;
    },
    deletedAllParticipant: () => {
      const participantLength = participants.length;
      participants.splice(0, participantLength);
      return {
        count: participantLength,
      };
    },
  },
  Query: {
    // USER
    users: () => users,
    user: (_, { id }) => users.find((user) => user.id === parseInt(id)),

    // EVENT
    events: () => events,
    event: (_, { id }) => events.find((event) => event.id === parseInt(id)),

    // LOCATİON
    locations: () => locations,
    location: (_, { id }) =>
      locations.find((location) => location.id === parseInt(id)),

    // PARTİCİPANT
    participants: () => participants,
    participant: (_, { id }) =>
      participants.find((participant) => participant.id === parseInt(id)),
  },
};

const pubsub = createPubSub();

const server = createServer({
  schema: {
    typeDefs,
    resolvers,
  },
  context: { pubsub },
});

server.start();
