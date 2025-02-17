import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../config/axios';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useSelector } from 'react-redux';
import { formatDistanceToNow, format } from 'date-fns';

const CauseDetail = () => {
  const { id } = useParams();
  const [cause, setCause] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchCause = async () => {
      try {
        const response = await axios.get(`/api/causes/${id}`);
        setCause(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch cause details');
      } finally {
        setLoading(false);
      }
    };

    fetchCause();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8">Loading cause details...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  if (!cause) {
    return <div className="text-center py-8">Cause not found</div>;
  }

  const calculateProgress = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 p-6">
          <div>
            {cause.images && cause.images.length > 0 && (
              <div className="space-y-4">
                <img
                  src={cause.images[0]}
                  alt={cause.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="grid grid-cols-4 gap-2">
                  {cause.images.slice(1).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${cause.title} ${index + 2}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{cause.title}</h1>
              <p className="text-muted-foreground">
                By {cause.fundraiserId?.name}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>₹{cause.raisedAmount || 0}</span>
                <span>₹{cause.goalAmount}</span>
              </div>
              <Progress value={calculateProgress(cause.raisedAmount || 0, cause.goalAmount)} />
              <p className="text-sm text-muted-foreground">
                {calculateProgress(cause.raisedAmount || 0, cause.goalAmount)}% of goal reached
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">Campaign Duration:</p>
              <div className="text-sm text-muted-foreground">
                <p>Started: {format(new Date(cause.startDate), 'PPP')}</p>
                <p>Ends: {format(new Date(cause.endDate), 'PPP')}</p>
                <p>Time remaining: {formatDistanceToNow(new Date(cause.endDate), { addSuffix: true })}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">Description:</p>
              <p className="text-muted-foreground">{cause.description}</p>
            </div>

            {user?.role === 'donor' && (
              <Button className="w-full" size="lg">
                Donate Now
              </Button>
            )}

            {cause.documents?.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold">Supporting Documents:</p>
                <div className="space-y-2">
                  {cause.documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:underline"
                    >
                      View Document {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CauseDetail;
