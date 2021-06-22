import { gql } from '@apollo/client';
import Image from 'next/image';
import Link from 'next/link';
import PropTypes from 'prop-types';
import client from '../../lib/apollo';

export default function Location({
    location, residents, alive, dead, guests, robots, humans, aliens,
}) {
    return (
        <main>
            <Link href="/">Back to locations</Link>
            <h1>
                {location.name}
            </h1>
            <ul>
                <li>
                    {`Alive residents: ${alive}`}
                </li>
                <li>
                    {`Dead residents: ${dead}`}
                </li>
                <li>
                    {`Guest residents: ${guests}`}
                </li>
                <li>
                    {`Human residents: ${humans}`}
                </li>
                <li>
                    {`Robot residents: ${robots}`}
                </li>
                <li>
                    {`Alien residents: ${aliens}`}
                </li>
            </ul>
            <ul>
                {residents.map((resident) => (
                    <li key={resident.id}>
                        <Image
                            src={resident.image}
                            alt={resident.name}
                            width={150}
                            height={150}
                        />
                        <h3>{resident.name}</h3>
                        <p>{resident.status}</p>
                        <p>{resident.species}</p>
                    </li>
                ))}
            </ul>
        </main>
    );
}

Location.propTypes = {
    location: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        residents: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })),
    }).isRequired,
    residents: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        status: PropTypes.oneOf(['Dead', 'Alive', 'unknown']),
        species: PropTypes.string,
        gender: PropTypes.string,
        image: PropTypes.string,
        origin: PropTypes.shape({
            id: PropTypes.string,
        }),
    })),
    alive: PropTypes.number,
    dead: PropTypes.number,
    guests: PropTypes.number,
    robots: PropTypes.number,
    humans: PropTypes.number,
    aliens: PropTypes.number,
};

Location.defaultProps = {
    residents: [],
    alive: 0,
    dead: 0,
    guests: 0,
    robots: 0,
    humans: 0,
    aliens: 0,
};

const getLocationQuery = (locationId) => `query {
    location(id : ${locationId}){    
        id,
        name,
        residents { id }    
    }
}`;

const getResidentsQuery = (residentsIds) => `query {
    charactersByIds(ids: [${residentsIds}]) {
        id,
        name,
        status,
        species,
        gender,
        image
        origin { id },
    }
}`;

const getLocationsQuery = (page) => `query {
    locations(page:${page}){
      info{
        count,
        pages,
        next
      }
      results{
        id,
        name,
        dimension,
        type
      }
    }
  }`;

export const getStaticPaths = async () => {
    const firstPage = await client.query({
        query: gql`${getLocationsQuery(1)}`,
    });

    const remaingPages = await Promise
        .all(new Array(firstPage.data.locations.info.pages - 1)
            .fill(undefined)
            .map((_, i) => client.query({
                query: gql`${getLocationsQuery(2 + i)}`,
            })));

    const locations = [
        firstPage,
        ...remaingPages,
    ].reduce((_locations, page) => [..._locations, ...page.data.locations.results], []);

    return {
        paths: locations.map((location) => ({ params: { locationId: location.id } })),
        fallback: false,
    };
};

export const getStaticProps = async (context) => {
    try {
        const { params: { locationId } } = context;
        const { data: { location } } = await client.query({
            query: gql`${getLocationQuery(locationId)}`,
        });
        const residentsIds = location.residents.map((resident) => Number(resident.id));
        if (residentsIds.length === 0) {
            return {
                props: {
                    location,
                },
            };
        }
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
            if (resident.origin.id !== locationId) {
                newStats.guests += 1;
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
                revalidate: 60 * 60 * 24,
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
