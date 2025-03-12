const UpdateProfile: React.FC = () => {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Update Profile</h2>
        <form>
          <input type="text" placeholder="Full Name" className="w-full p-2 mb-4 border rounded" />
          <input type="text" placeholder="Bio" className="w-full p-2 mb-4 border rounded" />
          <input type="text" placeholder="Twitter URL" className="w-full p-2 mb-4 border rounded" />
          <input type="text" placeholder="Facebook URL" className="w-full p-2 mb-4 border rounded" />
          <input type="text" placeholder="LinkedIn URL" className="w-full p-2 mb-4 border rounded" />
          <input type="text" placeholder="GitHub URL" className="w-full p-2 mb-4 border rounded" />
          <input type="file" className="w-full p-2 mb-4 border rounded" />
          <button type="submit" className="bg-black text-white p-2 rounded">Update</button>
        </form>
      </div>
    );
  };
  
  export default UpdateProfile;