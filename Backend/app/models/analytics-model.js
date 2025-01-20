import {Schema , model} from 'mongoose'
const analyticsSchema = new Schema({
  totalDonations: Number,
  totalCauses: Number,
  topCauses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cause' }],
  monthlyStats: [{ month: String, donations: Number }],
  fundraiserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  causeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cause'},
  FundraiserCount: Number,
  donorCount: Number,
},{timestamps : true});

const Analytics = model('Analytics' , analyticsSchema)
export default Analytics