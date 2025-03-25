import { useState, useEffect } from 'react';

const useGetRole = (userEmail) => {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    const token = localStorage.getItem('jwt');

    useEffect(() => {
        const fetchRole = async () => {
            try {

                const response = await fetch(`${apiDomain}/users?page=0&size=1&email=${userEmail}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                let data = {}

                if (!response.ok) {
                    console.error('Network response was not ok');
                    data.role = null;
                } else{
                    data = await response.json();
                }

                setRole(data.content[0].role);
            } catch (err) {
                const message = "'Network response was not ok. Provisional role: GUEST'"
                console.error(message);
                err.message = message;
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        
        if(userEmail){
            fetchRole();
        }
    }, [userEmail, apiDomain, token]);

    return { role, loading, error };
};

export default useGetRole;