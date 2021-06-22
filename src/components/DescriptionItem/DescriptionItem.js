import PropTypes from 'prop-types';

const DescriptionItem = ({ label, value }) => (
    <li className="text-white text-opacity-90 text-xl min-w-max">
        <p className="font-bold">
            {label}
        </p>
        <p className="text-2xl">
            {value}
        </p>
    </li>
);

DescriptionItem.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
};

export default DescriptionItem;
