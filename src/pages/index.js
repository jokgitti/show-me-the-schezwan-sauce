import { useEffect, useState } from 'react';
import LocationCard from '../components/LocationCard';
import getAllLocations from '../lib/apollo/getAllLocations';

export default function Home({ locations, dimensions, types }) {
    const [dimension, setDimension] = useState('');
    const [type, setType] = useState('');
    const [name, setName] = useState('');
    const [visibleLocations, setVisibleLocations] = useState(locations);

    const onDimensionChange = (e) => {
        e.preventDefault();
        setDimension(e.target.value);
    };

    const onTypeChange = (e) => {
        e.preventDefault();
        setType(e.target.value);
    };

    const onNameChange = (e) => {
        e.preventDefault();
        setName(e.target.value);
    };

    useEffect(() => {
        const filterCriteria = [];
        if (type) {
            filterCriteria.push((value) => value.type === type);
        }
        if (dimension) {
            filterCriteria.push((value) => value.dimension === dimension);
        }
        if (name) {
            filterCriteria.push((value) => value.name.toLowerCase().includes(name.toLowerCase()));
        }

        if (filterCriteria.length === 0) {
            setVisibleLocations(locations);
        } else {
            const filteredLocations = locations
                .filter((location) => filterCriteria
                    .every((criteria) => criteria(location)));

            setVisibleLocations(filteredLocations);
        }
    }, [locations, dimension, type, name]);

    return (
        <main className="container mx-auto px-4 pb-8">
            <h1>Hello world</h1>
            <form>
                <label htmlFor="name">
                    Name:
                    <input
                        id="name"
                        type="text"
                        placeholder="Type a name to filter"
                        value={name}
                        onChange={onNameChange}
                    />
                </label>
                <label htmlFor="dimension">
                    Dimensions:
                    <select
                        id="dimension"
                        value={dimension}
                        onChange={onDimensionChange}
                    >
                        <option value="">
                            All dimensions
                        </option>
                        {dimensions.map((_dimension) => (
                            <option
                                key={_dimension}
                                value={_dimension}
                            >
                                {_dimension}
                            </option>
                        ))}
                    </select>
                </label>
                <label htmlFor="type">
                    Types:
                    <select
                        id="type"
                        value={type}
                        onChange={onTypeChange}
                    >
                        <option value="">
                            All types
                        </option>
                        {types.map((_type) => (
                            <option
                                key={_type}
                                value={_type}
                            >
                                {_type}
                            </option>
                        ))}
                    </select>
                </label>
            </form>
            <div className="flex flex-col  md:grid md:grid-cols-3 md:gap-4">
                {visibleLocations.map((location) => (
                    <LocationCard
                        key={location.id}
                        id={location.id}
                        name={location.name}
                        dimension={location.dimension}
                        type={location.type}
                    />
                ))}
            </div>
        </main>
    );
}

export const getStaticProps = async () => {
    try {
        const locations = await getAllLocations();

        const dimensions = new Set(locations.map((location) => location.dimension));
        const types = new Set(locations.map((location) => location.type));

        return {
            props: {
                locations,
                types: [...types].sort((a, b) => a.localeCompare(b)),
                dimensions: [...dimensions].sort((a, b) => a.localeCompare(b)),
                revalidate: 60 * 60 * 24,
            },
        };
    } catch (error) {
        console.log(error);
        return {
            props: {
                locations: [],
            },
        };
    }
};
