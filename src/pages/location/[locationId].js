/* eslint-disable no-nested-ternary */
import { gql } from '@apollo/client';
import Link from 'next/link';
import PropTypes from 'prop-types';
import DescriptionItem from '../../components/DescriptionItem';
import ResidentCard from '../../components/ResidentCard/ResidentCard';
import client from '../../lib/apollo';
import getAllLocations from '../../lib/apollo/getAllLocations';

export default function Location({
    location, residents, alive, dead, guests, robots, humans, aliens,
}) {
    return (
        <main>
            <button type="button" className="text-white opacity-90 underline">
                <Link href="/">← Back to locations</Link>
            </button>
            <h1 className="font-bold text-5xl mb-10 max-w-lg text-white opacity-90">
                {location.name}
            </h1>
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 mb-8">
                <DescriptionItem label="Dimension" value={location.dimension} />
                <DescriptionItem label="Type" value={location.type} />
            </ul>
            <h2 className="font-bold text-4xl mb-8 max-w-lg text-white opacity-90">
                Stats
            </h2>
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 mb-10">
                <DescriptionItem label="Alive residents" value={alive} />
                <DescriptionItem label="Dead residents" value={dead} />
                <DescriptionItem label="Guest residents" value={guests} />
                <DescriptionItem label="Human residents" value={humans} />
                <DescriptionItem label="Robot residents" value={robots} />
                <DescriptionItem label="Alien residents" value={aliens} />
            </ul>
            {residents.length === 0 && (
                <h2 className="font-bold text-center mt-16 text-3xl text-white text-opacity-90">
                    Nobody lives here 🙈
                </h2>
            )}
            <div className="flex flex-col  md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 lg:gap-8 xl:gap-12">
                {residents.map((resident) => (
                    <ResidentCard
                        key={resident.id}
                        gender={resident.gender}
                        image={resident.image}
                        name={resident.name}
                        species={resident.species}
                        status={resident.status}
                    />
                ))}
            </div>
        </main>
    );
}

Location.propTypes = {
    location: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        dimension: PropTypes.string,
        type: PropTypes.string,
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
        dimension,
        type,
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

export const getStaticPaths = async () => {
    const locations = await getAllLocations();

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
