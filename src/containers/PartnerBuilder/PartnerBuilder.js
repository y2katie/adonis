import React from "react";
import axios from "../../axios-orders";
import Partner from "../../components/Partner/Partner";
import BuildControls from "../../components/Partner/BuildControls/BuildControls";
import ModalExampleCloseIcon from "../../components/UI/Modal/Modal";
import OrderSummary from "../../components/Partner/OrderSummary/OrderSummary";
import { Grid, Container} from "semantic-ui-react";
import Spinner from "../../components/UI/Spinner/Spinner";
import withErrorHandler from "../../hoc/withErrorHandler/withErrorHandler";

const TRAIT_PRICES = {
  male: 0,
  female: 20,
  they: 40,
  books: 10,
  humor: 20,
  kindness: 100,
  financial_savy: 200,
  cooking: 20,
};

class PartnerBuilder extends React.Component {
  state = {

    traits: {
      male: 0,
      female: 0,
      they: 0,
      books: 0,
      humor: 0,
      kindness: 0,
      financial_savy: 0,
      cooking: 0,
    },
    totalPrice: 50,
    purchaseable: false,
    purchasing: false,
    loading: false,
  };

  // componentDidMount() {
  //   axios
  //     .get("https://partner-9b329-default-rtdb.firebaseio.com/traits.json")
  //     .then((response) => {
  //       this.setState({ traits: response.data });
  //     });
  // }

  updatePurchaseState(traits) {
    const sum = Object.keys(traits)
      .map((traitKey) => {
        return traits[traitKey];
      })
      .reduce((sum, el) => {
        return sum + el;
      }, 0);
    this.setState({ purchaseable: sum > 0 });
  }

  addTraitHandler = (type) => {
    const oldCount = this.state.traits[type];

    const updatedCount = oldCount + 1;
    const updatedTraits = {
      ...this.state.traits,
    };
    updatedTraits[type] = updatedCount;

    const priceAddition = TRAIT_PRICES[type];
    const oldPrice = this.state.totalPrice;
    const newPrice = oldPrice + priceAddition;
    this.setState({
      totalPrice: newPrice,
      traits: updatedTraits,
      purchaseable: true,
    });
    this.updatePurchaseState(updatedTraits);
  };

  removeTraitHandler = (type) => {
    const oldCount = this.state.traits[type];
    if (oldCount <= 0) {
      return;
    }
    const updatedCount = oldCount - 1;
    const updatedTraits = {
      ...this.state.traits,
    };
    updatedTraits[type] = updatedCount;

    const priceDeduction = TRAIT_PRICES[type];
    const oldPrice = this.state.totalPrice;
    const newPrice = oldPrice - priceDeduction;
    this.setState({ totalPrice: newPrice, traits: updatedTraits });
    this.updatePurchaseState(updatedTraits);
  };

  purchaseHandler = () => {
    this.setState({ purchasing: true });
  };

  purchaseCancelHandler = () => {
    this.setState({ purchasing: false });
  };

  purchaseContinueHandler = () => {
    this.setState({ loading: "true" });
    const order = {
      traits: this.state.traits,
      price: this.state.totalPrice,
      customer: {
        name: "Katie J",
        address: {
          street: "Hilda St",
          zipCode: "11020",
        },
        email: "test@test.com",
      },
      delivery: "fastest",
    };
    axios
      .post("/orders.json", order)
      .then((response) => this.setState({ loading: false, purchasing: false }))
      .catch((error) => this.setState({ loading: false, purchasing: false }));
  };

  render() {
    const disabledInfo = {
      ...this.state.traits,
    };

    for (let key in disabledInfo) {
      disabledInfo[key] = disabledInfo[key] <= 0;
    }



    return (
      <>
      <Container>
      <Grid stackable>
        <Grid.Row>
          <Grid.Column width={11} stackable>
            <Partner traits={this.state.traits} />
          </Grid.Column>

          <Grid.Column width={4}>
            <BuildControls
              traitAdded={this.addTraitHandler}
              traitRemoved={this.removeTraitHandler}
              disabled={disabledInfo}
              traits={this.state.traits}
              ordered={this.purchaseHandler}
              purchaseable={this.state.purchaseable}
              price={this.state.totalPrice}
            />

            <ModalExampleCloseIcon
              show={this.state.purchasing}
              purchaseContinue={this.purchaseContinueHandler}
              modalClosed={this.purchaseCancelHandler}
            >
            <OrderSummary
              price={this.state.totalPrice}
              purchaseContinue={this.purchaseContinueHandler}
              purchaseCancelled={this.purchaseCancelHandler}
              traits={this.state.traits}
            />
            </ModalExampleCloseIcon>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      </Container>
      </>
    );
  }
}

export default withErrorHandler(PartnerBuilder, axios);
