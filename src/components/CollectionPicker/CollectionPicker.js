import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouteMatch } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import selectAuth from '../../selectors/selectAuth';
import selectCollections from '../../selectors/selectCollections';
import fetchMyCollections from '../../actions/fetchMyCollections';
import addTasks from '../../actions/addTasks';
import completeTasks from '../../actions/completeTasks';
import postMyCollectionsMix from '../../api/postMyCollectionsMix';
import Button from '../Button';
import Icon from '../Icon';
import SelectCollection from './SelectCollection';
import styles from './CollectionPicker.module.css';

const SAVE_MIX_TO_COLLECTION = 'SAVE_MIX_TO_COLLECTION';

const CollectionPicker = ({ mixId, onClose }) => {
  const hasFetched = useRef(false);
  const inputRef = useRef(null);
  const match = useRouteMatch('/my/collections');
  const dispatch = useDispatch();
  const { token } = useSelector(selectAuth);
  const collections = useSelector(selectCollections);

  useEffect(() => {
    if (
      !match &&
      (!hasFetched.current ||
        (!collections.isFetching && collections.statusText === null && collections.collections.length === 0))
    ) {
      hasFetched.current = true;
      const action = fetchMyCollections();
      dispatch(action);
    }
  }, [match, collections, dispatch]);

  const handleSave = async (collectionId, collectionName = null) => {
    dispatch(addTasks(SAVE_MIX_TO_COLLECTION, 1));

    const response = await postMyCollectionsMix(mixId, collectionId, collectionName, token);

    if (!response.ok) {
      dispatch(completeTasks(SAVE_MIX_TO_COLLECTION, 1));
      return;
    }

    const result = await response.json();

    if (!result.success) {
      dispatch(completeTasks(SAVE_MIX_TO_COLLECTION, 1));
      return;
    }

    if (inputRef.current) inputRef.current.value = '';

    dispatch(fetchMyCollections(true));
    dispatch(completeTasks(SAVE_MIX_TO_COLLECTION, 1));
  };

  return (
    <div className={styles.root}>
      <Button onClick={onClose} text='Close' />
      <div className={styles.collections}>
        <div className={styles.new}>
          <input ref={inputRef} className={styles.input} placeholder='Create new collection' />
          <Button onClick={() => handleSave(0, inputRef.current.value)} Icon={Icon.Save} text='New' />
        </div>
        {collections.collections.map(({ id, name, count, mixes }, index) => (
          <SelectCollection
            key={`collection-${index}`}
            name={name}
            count={count}
            onClick={() => handleSave(id)}
            disabled={mixes.includes(mixId)}
          />
        ))}
      </div>
    </div>
  );
};

CollectionPicker.propTypes = {
  mixId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired
};

export default CollectionPicker;
