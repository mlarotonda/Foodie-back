class RatoneandoController {
  constructor() {}

  getData = async (req, res) => {
    try {
      const { userLogin, userPassword, nickName, email } = req.body;
      const newUser = await User.create({
        userLogin,
        userPassword,
        nickName,
        email,
      });
      res.status(200).send({ success: true, message: newUser });
    } catch (error) {
      res.status(400).send({ success: false, message: error.message });
    }
  };
}

export default new RatoneandoController();
