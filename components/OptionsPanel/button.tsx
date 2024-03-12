.styled-button {
    align-items: center;
    background-color: var(--btn-primary);
    border-radius: 4px;
    border: 1px solid rgb(204, 204, 204);
    color: white;
    display: flex;
    flex-direction: row;
    font-size: 14px;
    font-weight: 500;
    gap: 4px;
    height: var(--input-element-h);
    justify-content: center;
    min-width: 40px;
    padding: 2px 8px;
  
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  .styled-button:hover {
    background-color: var(--btn-primary-hover);
  }
  
  .styled-button-secondary {
    background-color: var(--btn-secondary);
  }
  
  .styled-button-secondary:hover {
    background-color: var(--btn-secondary-hover);
  }
  
  .styled-button:active {
    transform: scale(0.98);
  }
  
  .styled-button-small {
    height: 34px;
    padding: 0px 6px;
  }
  
  .styled-button-square {
    cursor: pointer;
    height: 36px;
    min-width: 36px;
    padding: 0;
    width: 36px;
  }
  
  .styled-button-square-small {
    cursor: pointer;
    height: 34px;
    min-width: 34px;
    padding: 0;
    width: 34px;
  }
  
  .styled-button-disabled {
    background-color: #bdbdbd;
  }
  
  .styled-button-disabled:hover {
    background-color: #bdbdbd;
  }
  
  @media (min-width: 800px) {
    .styled-button {
      height: 30px;
      min-width: unset;
      padding: 4px;
    }
  }