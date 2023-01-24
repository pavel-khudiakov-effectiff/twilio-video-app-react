import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Typography, makeStyles, TextField, Grid, Button, InputLabel, Theme } from '@material-ui/core';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';
import { useAppState } from '../../../state';
import { Steps } from '../PreJoinScreens';

const useStyles = makeStyles((theme: Theme) => ({
  gutterBottom: {
    marginBottom: '1em',
  },
  inputContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '1.5em 0 3.5em',
    '& div:not(:last-child)': {
      marginRight: '1em',
    },
    [theme.breakpoints.down('sm')]: {
      margin: '1.5em 0 2em',
    },
  },
  textFieldContainer: {
    width: '100%',
  },
  continueButton: {
    marginLeft: '1em',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
}));

interface RoomNameScreenProps {
  name: string;
  roomName: string;
  setName: (name: string) => void;
  setRoomName: (roomName: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isMediaReady: boolean;
  setStep: (step: Steps) => void;
}

export default function RoomNameScreen({
  name,
  roomName,
  setName,
  setRoomName,
  handleSubmit,
  isMediaReady,
  setStep,
}: RoomNameScreenProps) {
  const classes = useStyles();
  const { user } = useAppState();

  const { getToken, isFetching } = useAppState();
  const { connect: chatConnect } = useChatContext();
  const { connect: videoConnect, isConnecting } = useVideoContext();
  const [isSkipDeviceSelection, setSkipDeviceSelection] = useState<boolean>(false);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleRoomNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
  };

  const handleJoin = () => {
    getToken(name, roomName).then(({ token }) => {
      videoConnect(token);
      process.env.REACT_APP_DISABLE_TWILIO_CONVERSATIONS !== 'true' && chatConnect(token);
    });
  };

  useEffect(() => {
    if (isMediaReady && isSkipDeviceSelection && !isFetching && !isConnecting) {
      handleJoin();
      setSkipDeviceSelection(false);
    }
  }, [isMediaReady, isSkipDeviceSelection]);

  const hasUsername = !window.location.search.includes('customIdentity=true') && user?.displayName;

  return (
    <>
      <Typography variant="h5" className={classes.gutterBottom}>
        Join a Room
      </Typography>
      <Typography variant="body1">
        {hasUsername
          ? "Enter the name of a room you'd like to join."
          : "Enter your name and the name of a room you'd like to join"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <div className={classes.inputContainer}>
          {!hasUsername && (
            <div className={classes.textFieldContainer}>
              <InputLabel shrink htmlFor="input-user-name">
                Your Name
              </InputLabel>
              <TextField
                id="input-user-name"
                variant="outlined"
                fullWidth
                size="small"
                value={name}
                onChange={handleNameChange}
              />
            </div>
          )}
          <div className={classes.textFieldContainer}>
            <InputLabel shrink htmlFor="input-room-name">
              Room Name
            </InputLabel>
            <TextField
              autoCapitalize="false"
              id="input-room-name"
              variant="outlined"
              fullWidth
              size="small"
              value={roomName}
              onChange={handleRoomNameChange}
            />
          </div>
        </div>
        <Grid container justifyContent="flex-end">
          <Button
            variant="contained"
            type="submit"
            color="primary"
            disabled={!name || !roomName}
            className={classes.continueButton}
            onClick={() => {
              setStep(Steps.skipDeviceSelectionStep);
              setSkipDeviceSelection(true);
            }}
          >
            Skip Device Selection
          </Button>
          <Button
            variant="contained"
            type="submit"
            color="primary"
            disabled={!name || !roomName}
            className={classes.continueButton}
            onClick={() => {
              setStep(Steps.deviceSelectionStep);
            }}
          >
            Continue
          </Button>
        </Grid>
      </form>
    </>
  );
}
