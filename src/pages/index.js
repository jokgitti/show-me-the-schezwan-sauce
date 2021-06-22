import { gql } from '@apollo/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import client from '../lib/apollo';

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
        <main>
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
                        <option
                            value=""
                            selected
                        >
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
                        <option
                            value=""
                            selected
                        >
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
            {visibleLocations.map((location) => (
                <div key={location.id}>
                    <h2>
                        <Link href={`/location/${location.id}`}>
                            {location.name}
                        </Link>
                    </h2>
                    <p>
                        {location.dimension}
                    </p>
                    <p>
                        {location.type}
                    </p>
                </div>
            ))}
        </main>
    );
}

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

export const getServerSideProps = async () => {
    try {
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

        const dimensions = new Set(locations.map((location) => location.dimension));
        const types = new Set(locations.map((location) => location.type));

        return {
            props: {
                locations,
                types: [...types].sort((a, b) => a.localeCompare(b)),
                dimensions: [...dimensions].sort((a, b) => a.localeCompare(b)),
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
