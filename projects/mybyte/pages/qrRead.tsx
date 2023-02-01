import React, { useState } from 'react';
import Html5QrcodePlugin from '../components/Html5QrcodePlugin';
import OrganizerRoute from '../components/OrganizerRoute';
import { useAuth } from '../context/AuthContext';

export default function QrRead(props: any) {
  const [data, setData] = useState('No result');
  const {givePoints} = useAuth();

  return (
    <OrganizerRoute>
      <Html5QrcodePlugin
        fps={10}
        qrbox={250}
        disableFlip={false}
        qrCodeSuccessCallback={(decodedText: string, decodedResult: any) => {
            if (data === decodedText) return;
            if (decodedText.match(new RegExp("^(?!\.\.?$)(?!.*__.*__)([^/]{1,1500})$"))) {
                setData("Not valid User QR-Code");
                return;
            } // https://stackoverflow.com/questions/52850099/what-is-the-reg-expression-for-firestore-constraints-on-document-ids
            setData(decodedText);
            try {
                givePoints(decodedText, 1);
            } catch(error) {
                console.log(`Something happened: ${error}`);
            }
        }}
      />
      <p>{data}</p>
    </OrganizerRoute>
  );
};