import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Image,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import cityData from "../../public/city.json";
import { URL_ANDROID } from "@env";
import {
  FontAwesome6,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import TourCard from "../../components/index/TourCard";
import OutstandingCard from "../../components/index/OutstandingCard";
import { Context } from "../../context/ContextProvider";
import ModalDate from "../../components/index/ModalDate";
import ModalFilterIndex from "../../components/index/ModalFilterIndex";
import ModalSortIndex from "../../components/index/ModalSortIndex";
// import { ImageAnalysisModal, useImageAnalysis } from '../../components/index/ImageAnalysisModal ';
import { LogBox } from 'react-native';

// Đặt ở đầu file, ngoài component
LogBox.ignoreLogs([
  'Warning: TRenderEngineProvider: Support for defaultProps will be removed',
  'Warning: MemoizedTNodeRenderer: Support for defaultProps will be removed',
  'Warning: TNodeChildrenRenderer: Support for defaultProps will be removed',
]);

function Discover() {
  const { fontsLoaded } = useContext(Context);
  const [tours, setTours] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [query, setQuery] = useState("");
  const [tempTour, setTempTour] = useState([]);
  const [isNotFound, setIsNotFound] = useState(false);
  const [totalTour, setTotalTour] = useState(0);
  const [endDate, setEndDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [numberOfToursVisible, setNumberOfToursVisible] = useState(5);
  const [loading, setLoading] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [outstandingTours, setOutstandingTours] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    price: { minPrice: '', maxPrice: '', equalPrice: '' },
    place: [],
    duration: []
  });
  const [filterData, setFilterData] = useState({
    place: [],
    duration: []
  });

  const numberOfCardTourDisplay = 5;
  const loadingTime = 1000;

  const handleFilterApply = (values, type) => {
    let newActiveFilters;

    if (type) {
      // Single filter
      newActiveFilters = { ...activeFilters, [type]: values };
    } else {
      // Full filter
      newActiveFilters = values;
    }

    setActiveFilters(newActiveFilters);
    applyFilters(newActiveFilters);
  };

  const applyFilters = useCallback((filters, baseData = null) => {
    let result = [...(baseData || searchResults || tours)];

    // Apply date filter
    if (startDate) {
      result = result.filter(originalTour => {
        return originalTour.subsidiaryTours.some(subTour => {
          const subTourStartDate = new Date(subTour.dateStart.date || subTour.dateStart);
          const subTourEndDate = new Date(subTour.dateEnd);

          subTourStartDate.setHours(0, 0, 0, 0);
          subTourEndDate.setHours(0, 0, 0, 0);

          const filterStartDate = new Date(startDate);
          filterStartDate.setHours(0, 0, 0, 0);

          if (endDate) {
            const filterEndDate = new Date(endDate);
            filterEndDate.setHours(0, 0, 0, 0);

            return filterStartDate.getTime() === filterEndDate.getTime() ?
              subTourStartDate.getTime() === filterStartDate.getTime() :
              subTourStartDate.getTime() === filterStartDate.getTime() &&
              subTourEndDate.getTime() === filterEndDate.getTime();
          }
          return subTourStartDate.getTime() === filterStartDate.getTime();
        });
      });
    }

    // Apply price filter
    if (filters.price?.equalPrice || filters.price?.minPrice || filters.price?.maxPrice) {
      result = result.filter(tour => {
        const price = Number(tour.price);

        // First check equal price
        if (filters.price.equalPrice) {
          return price === Number(filters.price.equalPrice);
        }

        // Then check price range
        const min = filters.price.minPrice ? Number(filters.price.minPrice) : 0;
        const max = filters.price.maxPrice ? Number(filters.price.maxPrice) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Apply place filter - UPDATED to handle array of places
    if (filters.place?.length > 0) {
      // Lấy danh sách codes từ danh sách địa điểm được chọn
      const selectedPlaceCodes = filters.place.map(placeObj => {
        // Nếu filters.place là array of objects có cả code và name
        if (typeof placeObj === 'object' && placeObj.code) {
          return placeObj.code;
        }
        // Nếu filters.place là array of strings (code trực tiếp)
        return placeObj;
      });

      result = result.filter(tour => {
        // Check if at least one place in the tour's place array matches one of the selected place codes
        return selectedPlaceCodes.some(selectedPlaceCode =>
          tour.place && Array.isArray(tour.place) && tour.place.includes(selectedPlaceCode)
        );
      });
    }

    // Apply duration filter
    if (filters.duration?.length > 0) {
      result = result.filter(tour => filters.duration.includes(tour.duration.toString()));
    }

    setTempTour(result);
    setTotalTour(result.length);
    setIsNotFound(result.length === 0);
  }, [tours, startDate, endDate, searchResults]);


  const getTopRatedTours = async (tours) => {
    try {
      // Step 1: Get all subsidiary tours for each original tour
      const toursWithRatingsPromises = tours.map(async (originalTour) => {
        try {
          // Fetch subsidiary tours related to originalTourId
          const subsidiaryToursRes = await axios.get(`${URL_ANDROID}/subsidiaryTours`);
          const relatedSubsidiaryTours = subsidiaryToursRes.data?.subsidiaryTours?.filter(
            (subTour) => subTour.originalTourId._id.toString() === originalTour._id
          ) || [];

          if (relatedSubsidiaryTours.length === 0) {
            return null;
          }
          
          // Get subTourIds for fetching reviews
          const subTourIds = relatedSubsidiaryTours.map(subTour => subTour._id);

          // Fetch reviews for all related subsidiary tours at once
          const reviewsResponse = await axios.post(`${URL_ANDROID}/review-tour/tour-reviews-by-subtours`, {
            subTourIds
          });

          const reviews = reviewsResponse.data?.reviews || [];

          // Only consider tours with at least 5 reviews
          if (reviews.length >= 5) {
            // Calculate total rating across all reviews
            const totalRating = reviews.reduce((acc, review) => {
              const reviewAvg = (
                review.rating.transport +
                review.rating.services +
                review.rating.priceQuality
              ) / 3;
              return acc + reviewAvg;
            }, 0);

            return {
              ...originalTour,
              averageRating: totalRating / reviews.length,
              reviewCount: reviews.length
            };
          }
          return null;
        } catch (error) {
          console.error(`Error processing tour ${originalTour._id}:`, error);
          return null;
        }
      });

      // Wait for all tours to be processed
      const toursWithRatings = await Promise.all(toursWithRatingsPromises);

      // Filter out null values and sort by average rating AND review count
      const validTours = toursWithRatings
        .filter(tour => tour !== null)
        .sort((a, b) => {
          // Primary sort by average rating (highest first)
          if (b.averageRating !== a.averageRating) {
            return b.averageRating - a.averageRating;
          }
          // Secondary sort by review count for tours with same rating
          return b.reviewCount - a.reviewCount;
        })
        .slice(0, 3); // Get top 3

      return validTours;
    } catch (error) {
      console.error("Error getting top rated tours:", error);
      return [];
    }
  };

  const toggleModal = (type = null) => {
    setModalType(type);
    setModalVisible(!isModalVisible);
  };

  const FilterButtons = () => (
    <View style={Styles.filterButtonsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={Styles.filterButtonsWrapper}>
          {['price', 'place', 'duration'].map((type) => {
            const isActive = type === 'price'
              ? (activeFilters.price.minPrice || activeFilters.price.maxPrice || activeFilters.price.equalPrice)
              : activeFilters[type]?.length > 0;

            return (
              <Pressable
                key={type}
                style={[
                  Styles.filterButton,
                  isActive && Styles.activeFilterButton
                ]}
                onPress={() => toggleModal(type)}
              >
                <Text style={Styles.filterButtonText}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={22}
                  color={Colors.blackColorText}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <Pressable
        style={[
          Styles.mainFilterButton,
          Object.values(activeFilters).some(filter =>
            Array.isArray(filter) ? filter.length > 0 :
              typeof filter === 'object' ? (filter.minPrice || filter.maxPrice || filter.equalPrice) : false
          ) && Styles.activeFilterButton
        ]}
        onPress={() => toggleModal()}
      >
        <Image source={require("../../assets/images/filter.png")} />
      </Pressable>
    </View>
  );

  const handleSearch = () => {
    // Check if there are any active filters
    const hasActiveFilters = Object.values(activeFilters).some(filter =>
      Array.isArray(filter) ? filter.length > 0 :
        typeof filter === 'object' ? (filter.minPrice || filter.maxPrice) : false
    ) || startDate;

    // If there are active filters, reset filters and search on all tours
    if (hasActiveFilters) {
      // Reset all filters
      setActiveFilters({
        price: { minPrice: '', maxPrice: '', equalPrice: '' },
        place: [],
        duration: []
      });
      setStartDate(null);
      setEndDate(null);

      if (query.trim() === "") {
        setSearchResults(null);
        setTempTour(tours);
        setTotalTour(tours.length);
        setIsNotFound(false);
        return;
      }

      // Search on all tours
      const results = tours.filter((tour) =>
        tour.title.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(results);
      setTempTour(results);
      setTotalTour(results.length);
      setIsNotFound(results.length === 0);
    }
    // If no active filters, perform normal search
    else {
      if (query.trim() === "") {
        setSearchResults(null);
        setTempTour(tours);
        setTotalTour(tours.length);
        setIsNotFound(false);
        return;
      }

      const results = tours.filter((tour) =>
        tour.title.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(results);

      if (results.length > 0) {
        setTempTour(results);
        setTotalTour(results.length);
        setIsNotFound(false);
      } else {
        setTempTour([]);
        setIsNotFound(true);
        setTotalTour(0);
      }
    }
  };

  const handleShowResult = () => {
    switch (modalType) {
      case "place":
        if (selectedItem === null) {
          setTempTour(tours);
          setTotalTour(tours.length);
          setIsNotFound(false);
        } else {
          // Updated for array of places
          const tempTour = tours.filter((tour) => {
            // Check if tour.place is an array and if it contains the selected place
            return Array.isArray(tour.place) && tour.place.includes(selectedItem.trim());
          });

          if (tempTour.length > 0) {
            setTotalTour(tempTour.length);
            setIsNotFound(false);
            setQuery(selectedItem);
          } else {
            setTotalTour(0);
            setIsNotFound(true);
            setQuery(selectedItem);
          }
          setTempTour(tempTour);
        }
        setModalVisible(false);
        break;

      case "duration":
        if (selectedItem === null) {
          setTempTour(tours);
          setTotalTour(tours.length);
          setIsNotFound(false);
        } else {
          const day = selectedItem.split(" ")[0];
          const tempTour = tours.filter((tour) => {
            return tour.duration.toString() === day.trim();
          });

          if (tempTour.length > 0) {
            setTotalTour(tempTour.length);
            setIsNotFound(false);
            setQuery(selectedItem);
          } else {
            setTotalTour(0);
            setIsNotFound(true);
            setQuery(selectedItem);
          }

          setTempTour(tempTour);
        }
        setModalVisible(false);
        break;

      case "price":
        if (selectedItem === null) {
          setTempTour(tours);
          setTotalTour(tours.length);
          setIsNotFound(false);
        } else {
          const tempTour = tours.filter((tour) => {
            return (
              (Number(selectedItem.minPrice) <= Number(tour.price) &&
                Number(tour.price) <= Number(selectedItem.maxPrice)) ||
              Number(tour.price) === Number(selectedItem.equalPrice)
            );
          });
          if (tempTour.length > 0) {
            setTotalTour(tempTour.length);
            setIsNotFound(false);
          } else {
            setTotalTour(0);
            setIsNotFound(true);
          }
          setTempTour(tempTour);
        }
        setModalVisible(false);
        break;

      case "calendar":
        let tempTour;

        // Nếu không có startDate (và endDate), trả về toàn bộ tours hoặc searchResults
        if (!startDate) {
          tempTour = searchResults ? [...searchResults] : [...tours];
        } else {
          tempTour = tours.filter((originalTour) => {
            return originalTour.subsidiaryTours.some((subTour) => {
              if (!subTour.dateStart) return false;

              try {
                const subTourStartDate = new Date(subTour.dateStart.date);
                const subTourEndDate = new Date(subTour.dateEnd);
                subTourStartDate.setHours(0, 0, 0, 0);
                subTourEndDate.setHours(0, 0, 0, 0);

                const filterStartDate = new Date(startDate);
                filterStartDate.setHours(0, 0, 0, 0);

                if (endDate) {
                  const filterEndDate = new Date(endDate);
                  filterEndDate.setHours(0, 0, 0, 0);

                  if (filterStartDate.getTime() === filterEndDate.getTime()) {
                    return subTourStartDate.getTime() === filterStartDate.getTime();
                  }
                  return (
                    subTourStartDate.getTime() === filterStartDate.getTime() &&
                    subTourEndDate.getTime() === filterEndDate.getTime()
                  );
                }
                return subTourStartDate.getTime() === filterStartDate.getTime();
              } catch (error) {
                console.error("Error processing tour dates:", error);
                return false;
              }
            });
          });
        }

        // Áp dụng lại các bộ lọc khác nếu có
        if (allFieldsAreNotNull(activeFilters)) {
          applyFilters(activeFilters, tempTour);
        } else {
          setTempTour(tempTour);
          setTotalTour(tempTour.length);
          setIsNotFound(tempTour.length === 0);
        }

        setModalVisible(false);
        break;
      default:
        break;
    }
    setNumberOfToursVisible(numberOfCardTourDisplay);
  };

  const allFieldsAreNotNull = (obj) => {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === "price") {
          if (obj[key].minPrice !== "" || obj[key].maxPrice !== "") {
            return true;
          }
        } else {
          if (obj[key] !== null && obj[key].length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const handleReset = () => {
    setActiveFilters({
      price: { minPrice: '', maxPrice: '' },
      place: [],
      duration: []
    });

    // If there are search results, reset to search results
    if (searchResults) {
      setTempTour(searchResults);
      setTotalTour(searchResults.length);
    } else {
      setTempTour(tours);
      setTotalTour(tours.length);
    }
    setIsNotFound(false);
  };

  const handleSort = (type) => {
    let toursToSort = [...tempTour]; // Create a copy of tempTour to sort

    switch (type) {
      case "low to high":
        if (toursToSort.length > 0) {
          toursToSort.sort((a, b) => Number(a.price) - Number(b.price));
          setTempTour(toursToSort);
        } else {
          console.log("No tours to sort");
        }
        break;
      case "high to low":
        if (toursToSort.length > 0) {
          toursToSort.sort((a, b) => Number(b.price) - Number(a.price));
          setTempTour(toursToSort);
        } else {
          console.log("No tours to sort");
        }
        break;
      case "default":
        // For default, maintain filtered results but reset the sort
        if (allFieldsAreNotNull(activeFilters)) {
          // If active filters, maintain filtered results
          applyFilters(activeFilters);
        } else {
          // If no filters, show all tours in original order
          setTempTour([...tours]);
        }
        break;

      default:
        break;
    }
  };

  const handleShowMore = () => {
    if (numberOfToursVisible < totalTour) {
      setLoading(true);
      setTimeout(() => {
        setNumberOfToursVisible((prev) => prev + numberOfCardTourDisplay);
        setLoading(false);
      }, loadingTime);
    }
  };

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const originalToursResponse = await axios.get(`${URL_ANDROID}/originalTours`);
        const originalTours = originalToursResponse.data.originalTours;
        
        
        const subsidiaryToursResponse = await axios.get(`${URL_ANDROID}/subsidiaryTours`);
        const subsidiaryTours = subsidiaryToursResponse.data.subsidiaryTours;     
  
        const combinedTours = originalTours
          .filter(originalTour => originalTour.deleted === false)
          .map((originalTour) => {
            if (!originalTour._id) {
              console.error("OriginalTour is missing _id:", originalTour);
              return null;
            }
  
            const relatedSubsidiaryTours = subsidiaryTours.filter((subTour) => {
              const tourIdField = subTour.originalTourId._id;     
              
              if (!tourIdField) {
                console.error("SubsidiaryTour is missing tour reference ID:", subTour);
                return false;
              }
  
              return tourIdField.toString() === originalTour._id.toString();
            });         
  
            const validSubsidiaryTours = relatedSubsidiaryTours.filter(subTour =>
              subTour.hide === false &&
              subTour.isCanceled === false &&
              subTour.isDeleted === false &&
              subTour.price > 0 &&
              subTour.totalSlots > 0
            );
  
            if (validSubsidiaryTours.length === 0) {
              return null;
            }
  
            const minPrice = Math.min(...validSubsidiaryTours.map(subTour => subTour.price));
  
            if (minPrice <= 0) {
              return null;
            }
  
            return {
              ...originalTour,
              price: minPrice,
              subsidiaryTours: validSubsidiaryTours,
            };
          })
          .filter(tour => tour !== null);    
          
        setTours(combinedTours);
        setTotalTour(combinedTours.length);
        setTempTour(combinedTours);
  
        // Collect all unique places from all tours
        const allPlaceCodes = [];
        combinedTours.forEach(tour => {
          if (Array.isArray(tour.place)) {
            tour.place.forEach(placeCode => {
              if (placeCode && !allPlaceCodes.includes(placeCode)) {
                allPlaceCodes.push(placeCode);
              }
            });
          }
        });
  
        // Sort places alphabetically
        const uniquePlaces = allPlaceCodes.map(code => {
          const city = cityData.find(city => city.code === code);
          return {
            code: code,
            name: city ? city.name : code
          };
        }).sort((a, b) => a.name.localeCompare(b.name));
  
        // Get unique durations
        const uniqueDurations = [...new Set(combinedTours.map(tour => tour.duration.toString()))]
          .filter(Boolean)
          .sort((a, b) => Number(a) - Number(b));
  
        // Set filterData for place and duration filters
        setFilterData({
          place: uniquePlaces,
          duration: uniqueDurations
        });
  
        // Get top rated tours AFTER all other data is processed
        const topTours = await getTopRatedTours(combinedTours);
        setOutstandingTours(topTours);
        console.log("Outstanding tours set:", topTours.length);
      } catch (error) {
        console.error('Error fetching tours:', error);
        console.error('Error details:', error.response?.data || error.message);
      }
    };
  
    fetchTours();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.orange} />
      </View>
    );
  }
  

  return (
    <View style={{ flex: 1, paddingTop: 23 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{}}>
          <Image
            source={require("../../assets/images/primary_background.png")}
            style={{ width: "100%", height: 247 }}
          />
          <View
            style={{
              position: "absolute",
              top: "38%",
              left: "8%",
              width: "100%",
            }}
          >
            <Text style={Styles.bigText}>Explore the</Text>
            <Text style={Styles.bigText}>Beautiful World!</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
          <View style={Styles.inputWrapper}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                style={{ marginRight: 5 }}
                name="search"
                size={23}
                color={Colors.grey}
                onPress={handleSearch}
              />
              <TextInput
                style={{ width: "85%", fontSize: 15 }}
                placeholder="Enter your destination name"
                value={query}
                onChangeText={(text) => {
                  setQuery(text);
                  if (text === "") {
                    setTotalTour(tours.length);
                    setIsNotFound(false);
                    setTempTour(tours);
                  }
                  setModalType("");
                }}
                onSubmitEditing={handleSearch}
              />
              <Ionicons
                style={{ marginRight: -20 }}
                name="camera-outline"
                size={23}
                color={Colors.grey}
              // onPress={pickImage}
              />
            </View>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.orange,
              marginRight: 27,
              paddingVertical: 8,
              paddingHorizontal: 11,
              borderRadius: 10,
            }}
            onPress={() => {
              toggleModal("calendar");
            }}
          >
            <FontAwesome6 name="calendar-days" size={28} color={Colors.white} />
          </TouchableOpacity>
        </View>
        {modalType === "calendar" && (
          <ModalDate
            handleShowResult={handleShowResult}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            isOpen={isModalVisible}
            setIsOpen={setModalVisible}
            startDate={startDate} // Thêm prop này
            endDate={endDate}     // Thêm prop này
          />
        )}
        {/* package tour */}
        <View style={{ flex: 1 }}>
          <View>
            <Text style={Styles.heading}>Package Tour</Text>
            <View style={{ flexDirection: "row", paddingLeft: 22 }}>
              <FilterButtons />
            </View>

            <View
              style={{
                paddingVertical: 13,
                marginTop: 5,
                paddingHorizontal: 22,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    color: Colors.grey,
                    fontFamily: "GT Easti Medium",
                    fontWeight: "medium",
                  }}
                >
                  <Text>{totalTour}</Text> activities found
                </Text>
                <Pressable
                  onPress={() => setIsSortModalVisible(true)}
                  style={{ flexDirection: "row" }}
                >
                  <Text
                    style={{
                      color: Colors.blue,
                      fontFamily: "GT Easti Medium",
                      marginRight: 5,
                    }}
                  >
                    Sort by
                    <Image source={require("../../assets/images/icon-sort.png")} />
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* list card */}

            {isNotFound ? (
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "400",
                    color: Colors.grey,
                    fontStyle: "italic",
                    marginVertical: 50,
                  }}
                >
                  Not found your tour!!!
                </Text>
              </View>
            ) : (
              <>
                {tours?.length > 0 || tempTour.length > 0 ? (
                  <FlatList
                    scrollEnabled={false}
                    data={
                      tempTour.length <= 0 && modalType !== "price"
                        ? tours?.slice(0, numberOfToursVisible)
                        : tempTour?.slice(0, numberOfToursVisible)
                    }
                    renderItem={({ item }) => <TourCard item={item} />}
                    style={{ marginVertical: 5, paddingBottom: 15 }}
                    keyExtractor={(item) => item._id}
                  />
                ) : (
                  <ActivityIndicator size="large" color={Colors.orange} />
                )}

                {(tempTour.length > 0
                  ? numberOfToursVisible < tempTour.length
                  : numberOfToursVisible < (tours?.length || 0)) && (
                    <Pressable
                      onPress={handleShowMore}
                      style={{
                        padding: 10,
                        borderRadius: 20,
                        borderColor: Colors.blue,
                        borderWidth: !loading ? 2 : 0,
                        width: "25%",
                        marginHorizontal: "auto",
                      }}
                    >
                      {loading ? (
                        <ActivityIndicator size="large" color={Colors.orange} />
                      ) : (
                        <Text
                          style={{
                            textAlign: "center",
                            color: Colors.blue,
                            fontFamily: "GT Easti Medium",
                          }}
                        >
                          Show more
                        </Text>
                      )}
                    </Pressable>
                  )}
              </>
            )}
          </View>
        </View>
        {/* Modal */}

        <ModalFilterIndex
          isVisible={isModalVisible && modalType !== "calendar"}
          onClose={() => setModalVisible(false)}
          type={modalType}
          onApply={handleFilterApply}
          onReset={handleReset}
          initialValues={activeFilters}
          filterData={filterData}
          isFullScreen={!modalType}
        />

        <ModalSortIndex
          isVisible={isSortModalVisible}
          onClose={() => setIsSortModalVisible(false)}
          onSort={handleSort}
          initialValue="default"
        />

        {/* outstanding */}
        <View>
          <Text style={Styles.heading}>Outstanding</Text>
          {outstandingTours.length > 0 ? (
            <FlatList
              style={{ paddingHorizontal: 22 }}
              contentContainerStyle={{ paddingRight: 26 }}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              data={outstandingTours}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => <OutstandingCard item={item} />}
            />
          ) : (
            <View style={{ paddingHorizontal: 22, paddingBottom: 20 }}>
              <ActivityIndicator size="large" color={Colors.orange} />
              <Text style={{ textAlign: 'center', marginTop: 10, fontFamily: 'GT Easti Medium' }}>
                Loading top tours...
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

    </View>
  );
}

export default Discover;

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
  },
  inputWrapper: {
    flexDirection: "row",
    borderWidth: 1,
    width: 282,
    marginLeft: 22,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    borderColor: Colors.grey,
    flex: 1,
  },
  bigText: {
    fontSize: 24,
    fontFamily: "GT Easti Bold",
    color: Colors.white,
    flexDirection: "column",
  },
  heading: {
    paddingHorizontal: 22,
    color: Colors.orange,
    fontWeight: "bold",
    fontSize: 20,
    fontFamily: "GT Easti Bold",
    paddingVertical: 13,
    textTransform: "uppercase",
  },
  filterButtonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 27,
  },
  filterButtonsWrapper: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#DCDFE4',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  filterButtonText: {
    fontFamily: 'GT Easti Medium',
    fontSize: 15,
    color: Colors.blackColorText,
  },
  mainFilterButton: {
    borderWidth: 2,
    borderColor: '#DCDFE4',
    borderRadius: 10,
    padding: 11,
    marginLeft: 8,
  },
  activeFilterButton: {
    borderColor: '#213A58',
    borderWidth: 2,
  },
});
