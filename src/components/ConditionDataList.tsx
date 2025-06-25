

  const ConditionList = () => {
    return (
        <datalist id="condition_keys">
            <option value="has_citem"></option>
            <option value="has_not_citem"></option>
            <option value="has_unlockable"></option>
            <option value="has_not_unlockable"></option>
            <option value="has_stats"></option>
            <option value="has_not_stats"></option>
            <option value="is_in_region"></option>
            <option value="is_not_in_region"></option>
            <option value="has_active_cooldown"></option>
            <option value="has_not_active_cooldown"></option>
            <option value="has_badge"></option>
            <option value="has_not_badge"></option>
            <option value="has_prefix"></option>
            <option value="has_not_prefix"></option>
            <option value="has_title"></option>
            <option value="has_not_title"></option>
            <option value="has_currency"></option>
            <option value="has_not_currency"></option>
        </datalist>
    );
  };
  
  export default ConditionList;