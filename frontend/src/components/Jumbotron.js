import React from 'react';
import { Jumbotron as Jumbo, Container } from 'react-bootstrap';
import styled from 'styled-components';

const Styles = styled.div`
  .jumbo {
    background-size: cover;
    color: #efefef;
    height: 100px;
    position: relative;
    z-index: -2;
  }


`;

export const Jumbotron = () => (
  <Styles>
    <Jumbo fluid className="jumbo">
      <div className="overlay"></div>
    </Jumbo>
  </Styles>
)
