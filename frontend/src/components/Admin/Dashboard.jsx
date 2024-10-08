import { useEffect, useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import MenuIcon from '@mui/icons-material/Menu';
import { Col, Row } from "react-bootstrap";

const Dashboard = ({ activeTab, children }) => {

    const [onMobile, setOnMobile] = useState(false);
    const [toggleSidebar, setToggleSidebar] = useState(false);

    useEffect(() => {
        if (window.innerWidth < 600) {
            setOnMobile(true);
        }
    }, [])

    return (
        <>
            <main className="flex min-h-screen mt-14 sm:min-w-full">

                {!onMobile && <Sidebar activeTab={activeTab} />}
                {toggleSidebar && <Sidebar activeTab={activeTab} setToggleSidebar={setToggleSidebar}/>}

                <div className="w-full sm:w-4/5 sm:ml-72 min-h-screen">
                    <Row>
                        <Col sm = {1}>

                        </Col>
                        <Col sm={11}>
                            <button onClick={() => setToggleSidebar(true)} className="sm:hidden bg-gray-700 w-10 h-10 rounded-full shadow text-white flex items-center justify-center"><MenuIcon /></button>
                            {children}
                        </Col>
                    </Row>

                </div>
            </main>
        </>
    );
};

export default Dashboard;
