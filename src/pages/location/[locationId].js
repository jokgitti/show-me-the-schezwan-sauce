import { gql } from '@apollo/client';
import client from '../../lib/apollo';

export default function Location() {
    return (
        <h1>
            hello world
        </h1>
    );
}

const getLocationQuery = (locationId) => `query {
  location(id : ${locationId}){    
      id,
      name,
      residents { id }    
  }
}`;

const getResidentsQuery = (residentsIds) => `query {
    charactersByIds(ids: [${residentsIds}]) {
      name,
      status,
      species,
      gender,
      image
      origin { name },
    }
  }`;

export const getServerSideProps = async (context) => {
    try {
        const { data: { location } } = await client.query({
            query: gql`${getLocationQuery(context.params.locationId)}`,
        });
        const residentsIds = location.residents.map((resident) => Number(resident.id));
        const { data: { charactersByIds: residents } } = await client.query({
            query: gql`${getResidentsQuery(residentsIds)}`,
        });

        const residentsStats = residents.reduce((_stats, resident) => {
            const newStats = { ..._stats };
            if (resident.status === 'Alive') {
                newStats.alive += 1;
            }
            if (resident.status === 'Dead') {
                newStats.dead += 1;
            }
            if (resident.species === 'Robot') {
                newStats.robots += 1;
            }
            if (resident.species === 'Human') {
                newStats.humans += 1;
            }
            if (resident.species === 'Alien') {
                newStats.aliens += 1;
            }
            return newStats;
        }, {
            alive: 0,
            dead: 0,
            guests: 0,
            robots: 0,
            humans: 0,
            aliens: 0,
        });

        return {
            props: {
                location,
                residents,
                ...residentsStats,
            },
        };
    } catch (error) {
        console.log(error);
        return {
            props: {
            },
        };
    }
};
