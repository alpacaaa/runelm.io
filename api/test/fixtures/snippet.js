

module.exports = [
  {
    id: "test-A",
    files: [
      {
        filename: "Main.elm",
        content: `
module Main exposing (..)

import Html exposing (Html, text)


main : Html msg
main =
    Html.text "Hello, World!"
        `
      }
    ],
    dependencies: {
      "elm-lang/core": "5.0.0 <= v < 6.0.0",
      "elm-lang/html": "2.0.0 <= v < 3.0.0",
    }
  },


  {
    id: "beginner-program",
    files: [
      {
        filename: "Main.elm",
        content: `
module Main exposing (..)

import Html exposing (..)


main =
    beginnerProgram
        { model = model
        , update = update
        , view = view
        }



-- TYPES


type alias Model =
    { message : String
    }


type Msg
    = NoOp



-- MODEL


model : Model
model =
    { message = "Elm beginnerProgram is ready. Get started!" }



-- UPDATE


update : Msg -> Model -> Model
update msg model =
    case msg of
        NoOp ->
            model



-- VIEW


view : Model -> Html Msg
view model =
    div [] [ text model.message ]

        `
      }
    ],
    dependencies: {
      "elm-lang/core": "5.0.0 <= v < 6.0.0",
      "elm-lang/html": "2.0.0 <= v < 3.0.0",
    }
  },


  {
    id: "program",
    files: [
      {
        filename: "Main.elm",
        content: `
module Main exposing (..)

import Html exposing (Html, text, div)


main : Program Never Model Msg
main =
    Html.program
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }



-- TYPES


type alias Model =
    { message : String
    }


type Msg
    = NoOp



-- MODEL


init : ( Model, Cmd Msg )
init =
    ( { message = "Elm program is ready. Get started!" }, Cmd.none )



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    ( model, Cmd.none )



-- VIEW


view : Model -> Html Msg
view model =
    div [] [ text model.message ]



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none

        `
      }
    ],
    dependencies: {
      "elm-lang/core": "5.0.0 <= v < 6.0.0",
      "elm-lang/html": "2.0.0 <= v < 3.0.0",
    }
  },

]
