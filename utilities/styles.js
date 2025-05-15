import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
  actionsContainer: {
    backgroundColor: "grey",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 5,
  },
  actionText: {
    // marginHorizontal: 10,
    color: "blue",
  },
  errorText: {
    color: "#800000",
    fontSize: 14,
    marginTop: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "flex-end", // Align to the bottom
    alignItems: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
  },
  modalView: {
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 35,
    paddingVertical: 20,
    backgroundColor: "#15120F",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2, // Shadow above the modal
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  label: {
    width: "30%", // Adjust width as needed
    fontSize: 20,
    fontWeight: "600",
    textAlign: "right",
    marginRight: 10,
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
  },
  buttonSave: {
    borderColor: "#6b8e23",
  },
  buttonCancel: {
    borderColor: "#800000",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  income: { color: "#BA9731", fontSize: 16, fontWeight: "bold" },
  buttonText: {
    fontFamily: "Outfit-Regular",
    color: "#BA9731",
    fontSize: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#15120F",
  },
  scrollView: {
    backgroundColor: "#15120F",
    height: "100%",
  },
  card: {
    backgroundColor: "#322A28",
    borderRadius: 15,
    margin: 20,
    padding: 20,
  },
  cardHead: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "auto",
    marginBottom: 15,
  },
  cardBody: {
    marginTop: 10,
  },
  cardSecondBody: {
    marginTop: 5,
  },
  cardBodyHeader: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: 40,
    width: "100%",
  },
  cardBodyContent: {
    marginVertical: 5,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BA9731",
    borderRadius: 10,
    padding: 4,
    width: "auto",
    marginLeft: 10,
  },
  cardBodyAction: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cardFooterContent: {
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dividerHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#BA9731",
    borderStyle: "solid",
  },
  dividerItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#BA9731",
    borderStyle: "dashed",
    margin: 2,
  },
  dividerFooter: {
    borderBottomWidth: 1,
    borderBottomColor: "#BA9731",
    borderStyle: "solid",
    marginTop: 10,
  },
  cardItem: {
    // marginVertical: 5,
    fontSize: 16,
    // width: "auto",
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#fefefe",
  },
  footerCardItem: {
    fontSize: 16,
    // width: "auto",
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#BA9731",
  },
  cardItemHeader: {
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#fefefe",
    marginVertical: 5,
  },
  cardItemFooter: {
    fontSize: 14,
    // width: "auto",
    width: "25%",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "#FEFEFE",
  },
  badge: {
    backgroundColor: "#fefefe",
    justifyContent: "center",
    alignItems: "center",
    width: "auto",
    height: 22,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  foot: {
    borderRadius: 10,
  },
  iconContainer: {
    marginBottom: 5,
    padding: 2,
    borderRadius: 3,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionsContainer: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 40,
    backgroundColor: "#DACE84",
    borderRadius: 5,
    padding: 5,
    width: "auto",
  },
  option: {
    color: "#050505",
    fontSize: 16,
  },
  input: {
    width: "60%",
    height: 40,
    textAlign: "center",
    color: "#BA9731", // Text color to make it readable
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "transparent", // Makes the background invisible
  },
  modalInput: {
    width: "60%",
    height: 40,
    textAlign: "left",
    color: "#BA9731", // Text color to make it readable
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "transparent", // Makes the background invisible
    padding: 5,
    borderBottomWidth: 1,
    borderColor: "#fefefe",
    borderRadius: 0,
  },
  tabContainer: {
    height: 200, // Ensures correct tab height
  },
  scene: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabBar: {
    backgroundColor: "#BA9731",
  },
  tabLabel: {
    color: "white",
  },
  tabIndicator: {
    backgroundColor: "white",
  },
  text: {
    color: "#fefefe",
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    backgroundColor: "#fefefe",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
});

export default styles;
